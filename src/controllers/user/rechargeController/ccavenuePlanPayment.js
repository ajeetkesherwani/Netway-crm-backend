const crypto = require("crypto");
const axios = require("axios");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");
const Package = require("../../../models/package");
const PlanPayment = require("../../../models/planPayment");
const { getCCAvenueConfig } = require("../../../config/ccavenue.config");
const { encrypt, decrypt } = require("../../../utils/ccavenueCrypto");
const {
  getPlanPrice,
  activatePaidPlan,
} = require("../../../services/planPurchase");

const amountInPaise = (amount) => Math.round(Number(amount) * 100);

const getGatewayResponse = (encryptedResponse) => {
  const params = new URLSearchParams(encryptedResponse);
  return Object.fromEntries(params.entries());
};

const getCCAvenueStatusResponse = async (config, orderId) => {
  const request = JSON.stringify({ order_no: orderId });
  const response = await axios.post(
    config.merchantApiUrl,
    new URLSearchParams({
      enc_request: encrypt(request.toString(), config.workingKey),
      access_code: config.accessCode,
      command: "orderStatusTracker",
      request_type: "JSON",
      response_type: "JSON",
      version: "1.2",
    }).toString(),
    {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      timeout: 15000,
    }
  );

  const envelope =
    typeof response.data === "string"
      ? Object.fromEntries(new URLSearchParams(response.data).entries())
      : response.data;
  if (String(envelope.status) !== "0" || !envelope.enc_response) {
    throw new AppError("CCAvenue could not verify the payment status", 502);
  }

  try {
    return JSON.parse(decrypt(envelope.enc_response, config.workingKey));
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError("CCAvenue returned an invalid status response", 502);
  }
};

exports.createPlanPayment = catchAsync(async (req, res, next) => {
  const { packageId } = req.body;
  const user = req.user;
  const { matchedPackage, amount } = await getPlanPrice(user, packageId);

  if (!Number.isFinite(amount) || amount <= 0) {
    return next(new AppError("Package price must be greater than zero", 400));
  }

  const config = getCCAvenueConfig();
  const general = user.generalInformation || {};
  const billingAddress = user.addressDetails?.billingAddress || {};
  const address = [
    general.address,
    billingAddress.addressine1,
    billingAddress.addressine2,
  ]
    .filter(Boolean)
    .join(", ");
  const billingDetails = {
    name: general.billingName || general.name,
    email: general.email,
    phone: general.phone,
    address,
    city: billingAddress.city || general.district,
    state: billingAddress.state || general.state,
    zip: billingAddress.pincode || general.pincode,
    country: general.country || "India",
  };

  const missingBillingDetails = Object.entries(billingDetails)
    .filter(([, value]) => !value)
    .map(([key]) => key);
  if (missingBillingDetails.length) {
    return next(
      new AppError(
        `Missing billing details required by CCAvenue: ${missingBillingDetails.join(", ")}`,
        400
      )
    );
  }

  const orderId = `NW${Date.now()}${crypto.randomBytes(4).toString("hex")}`;
  const payment = await PlanPayment.create({
    orderId,
    userId: user._id,
    packageId,
    amount,
  });
  const gatewayRequest = new URLSearchParams({
    merchant_id: config.merchantId,
    order_id: orderId,
    currency: "INR",
    amount: amount.toFixed(2),
    redirect_url: config.callbackUrl,
    cancel_url: config.callbackUrl,
    language: "EN",
    billing_name: billingDetails.name,
    billing_email: billingDetails.email,
    billing_tel: billingDetails.phone,
    billing_address: billingDetails.address,
    billing_city: billingDetails.city,
    billing_state: billingDetails.state,
    billing_zip: billingDetails.zip,
    billing_country: billingDetails.country,
    merchant_param1: packageId,
  });

  successResponse(
    res,
    "Plan payment created",
    {
      paymentId: payment._id,
      orderId,
      amount: payment.amount,
      currency: "INR",
      packageName: matchedPackage.name,
      gatewayUrl: config.paymentGatewayUrl,
      gatewayFields: {
        encRequest: encrypt(gatewayRequest.toString(), config.workingKey),
        access_code: config.accessCode,
      },
    },
    201
  );
});

exports.handleCCAvenueCallback = catchAsync(async (req, res, next) => {
  const encryptedResponse = req.body?.encResp;
  if (typeof encryptedResponse !== "string" || !encryptedResponse) {
    return next(new AppError("Missing CCAvenue encResp callback field", 400));
  }

  const config = getCCAvenueConfig();
  const gatewayResponse = getGatewayResponse(
    decrypt(encryptedResponse, config.workingKey)
  );
  const { order_id: orderId, order_status: orderStatus } = gatewayResponse;
  if (!orderId) {
    return next(new AppError("CCAvenue response is missing order_id", 400));
  }

  const payment = await PlanPayment.findOne({ orderId });
  if (!payment) {
    return next(new AppError("Payment order not found", 404));
  }

  if (
    gatewayResponse.merchant_id !== config.merchantId ||
    gatewayResponse.currency !== "INR" ||
    amountInPaise(gatewayResponse.amount) !== amountInPaise(payment.amount)
  ) {
    return next(new AppError("CCAvenue payment details do not match the order", 400));
  }

  if (payment.status === "Paid") {
    return successResponse(res, "Plan payment already processed", {
      orderId,
      status: payment.status,
    });
  }

  if (orderStatus !== "Success") {
    payment.status = "Failed";
    payment.gatewayTrackingId = gatewayResponse.tracking_id;
    payment.gatewayOrderStatus = orderStatus || "Unknown";
    payment.processedAt = new Date();
    await payment.save();
    return successResponse(res, "Plan payment was not successful", {
      orderId,
      status: payment.status,
    });
  }

  const claimedPayment = await PlanPayment.findOneAndUpdate(
    { _id: payment._id, status: "Pending" },
    {
      $set: {
        status: "Processing",
        gatewayTrackingId: gatewayResponse.tracking_id,
        gatewayOrderStatus: orderStatus,
      },
    },
    { new: true }
  );

  if (!claimedPayment) {
    const latestPayment = await PlanPayment.findById(payment._id);
    return successResponse(res, "Plan payment is being processed", {
      orderId,
      status: latestPayment.status,
    });
  }

  try {
    const statusResponse = await getCCAvenueStatusResponse(config, orderId);
    if (
      statusResponse.order_no !== orderId ||
      statusResponse.order_status !== "Successful" ||
      statusResponse.order_currncy !== "INR" ||
      amountInPaise(statusResponse.order_amt) !== amountInPaise(payment.amount)
    ) {
      throw new AppError(
        "CCAvenue status API did not confirm the expected successful payment",
        502
      );
    }

    const plan = await Package.findById(payment.packageId).lean();
    if (!plan) throw new AppError("Purchased plan package no longer exists", 404);

    const purchasedPlan = await activatePaidPlan({
      userId: payment.userId,
      packageId: payment.packageId,
      amount: payment.amount,
      orderId,
      validity: plan.validity,
    });

    claimedPayment.status = "Paid";
    claimedPayment.gatewayTrackingId =
      statusResponse.reference_no || gatewayResponse.tracking_id;
    claimedPayment.gatewayOrderStatus = statusResponse.order_status;
    claimedPayment.purchasedPlanId = purchasedPlan._id;
    claimedPayment.processedAt = new Date();
    await claimedPayment.save();

    return successResponse(res, "Broadband plan payment verified", {
      orderId,
      status: claimedPayment.status,
      purchasedPlanId: purchasedPlan._id,
    });
  } catch (error) {
    claimedPayment.status = "Pending";
    await claimedPayment.save();
    return next(error);
  }
});

exports.getPlanPaymentStatus = catchAsync(async (req, res, next) => {
  const { orderId } = req.params;
  const payment = await PlanPayment.findOne({
    orderId,
    userId: req.user._id,
  }).lean();

  if (!payment) return next(new AppError("Payment order not found", 404));

  return successResponse(res, "Plan payment status", {
    orderId: payment.orderId,
    amount: payment.amount,
    status: payment.status,
    gatewayTrackingId: payment.gatewayTrackingId,
    purchasedPlanId: payment.purchasedPlanId,
  });
});
