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

const WebhookLog = require("../../../models/webhookLog");

// ─── helpers ────────────────────────────────────────────────────────────────

const amountInPaise = (amount) => Math.round(Number(amount) * 100);
const SUCCESSFUL_STATUSES = ["success", "successful"];
const FAILED_STATUSES = [
  "failure",
  "failed",
  "unsuccessful",
  "aborted",
  "invalid",
];
const isFinalStatus = (status) =>
  SUCCESSFUL_STATUSES.includes(status.toLowerCase()) ||
  FAILED_STATUSES.includes(status.toLowerCase());

const getGatewayResponse = (encryptedResponse) => {
  const params = new URLSearchParams(encryptedResponse);
  return Object.fromEntries(params.entries());
};

/**
 * Upsert a single WebhookLog document per orderId.
 * ONE document per order — always updated, never duplicated.
 */
const upsertWebhookLog = (orderId, fields) => {
  if (!orderId) return Promise.resolve(); // no orderId yet (early decrypt errors) – skip
  return WebhookLog.findOneAndUpdate(
    { orderId },
    { $set: { ...fields, orderId } },
    { upsert: true, new: true }
  ).catch((err) => console.error("WebhookLog upsert error:", err.message));
};

// ─── CCAvenue status API ─────────────────────────────────────────────────────

const getCCAvenueStatusResponse = async (config, orderId) => {
  const request = JSON.stringify({ order_no: orderId });
  const encRequest = encrypt(request.toString(), config.workingKey);

  const payload = new URLSearchParams({
    enc_request: encRequest,
    access_code: config.accessCode,
    command: "orderStatusTracker",
    request_type: "JSON",
    response_type: "JSON",
    version: "1.2",
  }).toString();

  let response;
  try {
    response = await axios.post(
      config.merchantApiUrl,
      payload,
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        timeout: 15000,
      }
    );
  } catch (axiosErr) {
    if (axiosErr.response) {
      console.error(
        "CCAvenue orderStatusTracker failed:",
        axiosErr.response.status
      );
    } else {
      console.error("CCAvenue orderStatusTracker failed:", axiosErr.message);
    }
    throw new AppError(`CCAvenue Server unreachable: ${axiosErr.message}`, 502);
  }

  const envelope =
    typeof response.data === "string"
      ? Object.fromEntries(new URLSearchParams(response.data).entries())
      : response.data;

  if (String(envelope.status) !== "0" || !envelope.enc_response) {
    const errorCode = String(
      envelope.error_desc || envelope.enc_error_code || envelope.status || ""
    ).trim();
    const message = /\b51407\b/.test(errorCode)
      ? "CCAvenue Status API rejected the server IP (51407). Allowlist the backend's outbound public IP in the matching CCAvenue environment."
      : `CCAvenue could not verify status: ${errorCode || "Unknown Status API error"}`;
    throw new AppError(message, 502);
  }

  // When status is "0", enc_response is an AES-encrypted hex string per CCAvenue API spec
  const encHex = String(envelope.enc_response || "").trim();
  if (!/^(?:[0-9a-f]{32})+$/i.test(encHex)) {
    console.error("CCAvenue status API returned unexpected non-hex enc_response:", encHex);
    throw new AppError(
      `CCAvenue Status API response error: ${encHex || "Invalid enc_response"}`,
      502
    );
  }

  try {
    const decrypted = decrypt(encHex, config.workingKey);
    return JSON.parse(decrypted);
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError("CCAvenue returned an invalid status response", 502);
  }
};

// ─── reconcile ───────────────────────────────────────────────────────────────

const reconcilePaymentWithCCAvenue = async (payment, config, callbackTrackingId) => {
  let statusResponse;
  try {
    statusResponse = await getCCAvenueStatusResponse(config, payment.orderId);
  } catch (error) {
    const callbackStatus = String(payment.gatewayOrderStatus || "").trim();
    const normalizedCallbackStatus = callbackStatus.toLowerCase();
    const hasVerifiedCallbackStatus = [
      "success",
      "successful",
      "failure",
      "failed",
      "unsuccessful",
      "aborted",
      "invalid",
    ].includes(normalizedCallbackStatus);

    if (!/\b51407\b/.test(error.message) || !hasVerifiedCallbackStatus) {
      // If error is 51407 (IP whitelist issue) and callback hasn't arrived yet, keep Pending
      if (/\b51407\b/.test(error.message)) {
        console.warn("CCAvenue IP 51407 error during status check. Order remains Pending until callback arrives or IP is whitelisted.");
        return {
          orderId: payment.orderId,
          status: payment.status || "Pending",
          gatewayOrderStatus: payment.gatewayOrderStatus || "Awaited",
          ...(payment.purchasedPlanId && {
            purchasedPlanId: payment.purchasedPlanId,
          }),
        };
      }
      throw error;
    }

    statusResponse = {
      order_no: payment.orderId,
      order_status: callbackStatus,
      order_currncy: "INR",
      order_amt: payment.amount,
      reference_no: callbackTrackingId || payment.gatewayTrackingId,
    };
  }

  const statusOrderId = String(statusResponse.order_no || "");
  const statusCurrency = statusResponse.order_currncy || statusResponse.order_currency;
  const statusAmount = statusResponse.order_amt;

  if (
    statusOrderId !== payment.orderId ||
    String(statusCurrency).toUpperCase() !== "INR" ||
    amountInPaise(statusAmount) !== amountInPaise(payment.amount)
  ) {
    throw new AppError(
      "CCAvenue status response does not match the payment order",
      502
    );
  }

  const statusApiOrderStatus = String(statusResponse.order_status || "").trim();
  const callbackOrderStatus = String(payment.gatewayOrderStatus || "").trim();
  const statusApiIsFinal = isFinalStatus(statusApiOrderStatus);
  const callbackIsFinal = isFinalStatus(callbackOrderStatus);
  const gatewayStatus =
    statusApiIsFinal || !callbackIsFinal
      ? statusApiOrderStatus || "Unknown"
      : callbackOrderStatus;
  const normalizedStatus = gatewayStatus.toLowerCase();
  const isPaid = SUCCESSFUL_STATUSES.includes(normalizedStatus);
  const isFinalFailure = FAILED_STATUSES.includes(normalizedStatus);

  if (!isPaid) {
    const status = isFinalFailure ? "Failed" : "Pending";
    await PlanPayment.updateOne(
      { _id: payment._id, status: { $in: ["Pending", "Failed"] } },
      {
        $set: {
          status,
          gatewayTrackingId:
            statusResponse.reference_no || callbackTrackingId || payment.gatewayTrackingId,
          gatewayOrderStatus: gatewayStatus,
          ...(isFinalFailure ? { processedAt: new Date() } : {}),
        },
        ...(isFinalFailure ? {} : { $unset: { processedAt: "" } }),
      }
    );
    const latestPayment = await PlanPayment.findById(payment._id).lean();
    return {
      orderId: payment.orderId,
      status: latestPayment.status,
      gatewayOrderStatus: latestPayment.gatewayOrderStatus,
      ...(latestPayment.purchasedPlanId && {
        purchasedPlanId: latestPayment.purchasedPlanId,
      }),
    };
  }

  const claimedPayment = await PlanPayment.findOneAndUpdate(
    { _id: payment._id, status: { $in: ["Pending", "Failed"] } },
    {
      $set: {
        status: "Processing",
        gatewayTrackingId: statusResponse.reference_no || callbackTrackingId,
        gatewayOrderStatus: gatewayStatus,
      },
      $unset: { processedAt: "" },
    },
    { new: true }
  );

  if (!claimedPayment) {
    const latestPayment = await PlanPayment.findById(payment._id).lean();
    return {
      orderId: payment.orderId,
      status: latestPayment.status,
      gatewayOrderStatus: latestPayment.gatewayOrderStatus,
      ...(latestPayment.purchasedPlanId && {
        purchasedPlanId: latestPayment.purchasedPlanId,
      }),
    };
  }

  try {
    const plan = await Package.findById(payment.packageId).lean();
    if (!plan) throw new AppError("Purchased plan package no longer exists", 404);

    const purchasedPlan = await activatePaidPlan({
      userId: payment.userId,
      packageId: payment.packageId,
      amount: payment.amount,
      orderId: payment.orderId,
      validity: plan.validity,
    });

    claimedPayment.status = "Paid";
    claimedPayment.gatewayTrackingId =
      statusResponse.reference_no || callbackTrackingId;
    claimedPayment.gatewayOrderStatus = gatewayStatus;
    claimedPayment.purchasedPlanId = purchasedPlan._id;
    claimedPayment.processedAt = new Date();
    await claimedPayment.save();

    return {
      orderId: payment.orderId,
      status: claimedPayment.status,
      gatewayOrderStatus: claimedPayment.gatewayOrderStatus,
      purchasedPlanId: purchasedPlan._id,
    };
  } catch (error) {
    await PlanPayment.updateOne(
      { _id: claimedPayment._id, status: "Processing" },
      {
        $set: { status: "Pending" },
        $unset: { processedAt: "" },
      }
    );
    throw error;
  }
};

// ─── controllers ─────────────────────────────────────────────────────────────

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

  const clientIp =
    req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
    req.socket?.remoteAddress ||
    req.ip;

  // ── ONE document per order: upsert on orderId ──
  await upsertWebhookLog(orderId, {
    source: "ccavenue",
    event: "payment.initiated",
    status: "Pending",
    paymentId: null,
    purchaseId: packageId,
    payload: {
      userId: user._id,
      packageId,
      packageName: matchedPackage.name,
      amount,
      billingDetails,
    },
    error: null,
    ip: clientIp,
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
  const clientIp =
    req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
    req.socket?.remoteAddress ||
    req.ip;

  const encryptedResponse = req.body?.encResp;
  if (typeof encryptedResponse !== "string" || !encryptedResponse) {
    // No orderId yet — cannot upsert, just log to console
    console.error("WebhookLog: callback missing encResp", req.body);
    return next(new AppError("Missing CCAvenue encResp callback field", 400));
  }

  const config = getCCAvenueConfig();
  let decryptedText;
  try {
    decryptedText = decrypt(encryptedResponse, config.workingKey);
  } catch (decErr) {
    // No orderId available yet — cannot upsert
    console.error("WebhookLog: decrypt failed", decErr.message, req.body);
    return next(new AppError("Could not decrypt CCAvenue response", 400));
  }

  const gatewayResponse = getGatewayResponse(decryptedText);
  const { order_id: orderId, tracking_id: trackingId } = gatewayResponse;

  if (!orderId) {
    console.error("WebhookLog: callback missing order_id", gatewayResponse);
    return next(new AppError("CCAvenue response is missing order_id", 400));
  }

  const payment = await PlanPayment.findOne({ orderId });
  if (!payment) {
    // orderId exists but no PlanPayment — upsert with Failed status
    await upsertWebhookLog(orderId, {
      source: "ccavenue",
      event: "payment.callback",
      status: "Failed",
      paymentId: trackingId,
      payload: gatewayResponse,
      error: "Payment order not found in database",
      ip: clientIp,
    });
    return next(new AppError("Payment order not found", 404));
  }

  if (
    gatewayResponse.merchant_id !== config.merchantId &&
    gatewayResponse.merchant_id !== config.rawMerchantId
  ) {
    await upsertWebhookLog(orderId, {
      source: "ccavenue",
      event: "payment.callback",
      status: "Failed",
      paymentId: trackingId,
      payload: gatewayResponse,
      error: `Merchant ID mismatch: got ${gatewayResponse.merchant_id}`,
      ip: clientIp,
    });
    return next(new AppError("CCAvenue merchant ID does not match", 400));
  }

  if (
    gatewayResponse.currency !== "INR" ||
    amountInPaise(gatewayResponse.amount) !== amountInPaise(payment.amount)
  ) {
    await upsertWebhookLog(orderId, {
      source: "ccavenue",
      event: "payment.callback",
      status: "Failed",
      paymentId: trackingId,
      payload: gatewayResponse,
      error: `Amount/Currency mismatch. Got ${gatewayResponse.amount} ${gatewayResponse.currency}, expected ${payment.amount} INR`,
      ip: clientIp,
    });
    return next(new AppError("CCAvenue payment details do not match the order", 400));
  }

  const callbackOrderStatus = String(gatewayResponse.order_status || "Unknown").trim();
  const callbackTrackingId = gatewayResponse.tracking_id;
  if (payment.status !== "Paid") {
    await PlanPayment.updateOne(
      { _id: payment._id, status: { $in: ["Pending", "Failed"] } },
      {
        $set: {
          gatewayOrderStatus: callbackOrderStatus,
          ...(callbackTrackingId && { gatewayTrackingId: callbackTrackingId }),
        },
      }
    );
    payment.gatewayOrderStatus = callbackOrderStatus;
    if (callbackTrackingId) payment.gatewayTrackingId = callbackTrackingId;
  }

  if (payment.status === "Paid") {
    // Already paid — just update the log to show Paid, don't create a new doc
    await upsertWebhookLog(orderId, {
      source: "ccavenue",
      event: "payment.callback",
      status: "Paid",
      paymentId: callbackTrackingId,
      purchaseId: payment.purchasedPlanId,
      payload: gatewayResponse,
      error: null,
      ip: clientIp,
    });
    return successResponse(res, "Plan payment already processed", {
      orderId,
      status: payment.status,
    });
  }

  let result;
  try {
    result = await reconcilePaymentWithCCAvenue(
      payment,
      config,
      callbackTrackingId
    );

    // Update the SAME WebhookLog document with final status
    await upsertWebhookLog(orderId, {
      source: "ccavenue",
      event: "payment.callback",
      status: result.status === "Paid" ? "Paid" : result.status === "Failed" ? "Failed" : "Pending",
      paymentId: callbackTrackingId,
      purchaseId: result.purchasedPlanId || null,
      payload: gatewayResponse,
      error: null,
      ip: clientIp,
    });
  } catch (reconcileErr) {
    await upsertWebhookLog(orderId, {
      source: "ccavenue",
      event: "payment.callback",
      status: "Failed",
      paymentId: callbackTrackingId,
      payload: gatewayResponse,
      error: reconcileErr.message,
      ip: clientIp,
    });
    throw reconcileErr;
  }

  const message =
    result.status === "Paid"
      ? "Broadband plan payment verified"
      : result.status === "Failed"
        ? "Plan payment was not successful"
        : "Plan payment is still being processed";
  return successResponse(res, message, result);
});

exports.getPlanPaymentStatus = catchAsync(async (req, res, next) => {
  const { orderId } = req.params;
  let payment = await PlanPayment.findOne({
    orderId,
    userId: req.user._id,
  });

  if (!payment) return next(new AppError("Payment order not found", 404));

  if (payment.status !== "Paid") {
    const result = await reconcilePaymentWithCCAvenue(
      payment,
      getCCAvenueConfig(),
      payment.gatewayTrackingId
    );
    const message =
      result.status === "Paid"
        ? "Broadband plan payment verified"
        : result.status === "Failed"
          ? "Plan payment was not successful"
          : "Plan payment is still being processed";

    const clientIp =
      req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
      req.socket?.remoteAddress ||
      req.ip;

    // Update the SAME WebhookLog document — never create a new one
    await upsertWebhookLog(payment.orderId, {
      source: "ccavenue",
      event: "payment.status_check",
      status: result.status === "Paid" ? "Paid" : result.status === "Failed" ? "Failed" : "Pending",
      paymentId: result.gatewayTrackingId || payment.gatewayTrackingId || null,
      purchaseId: result.purchasedPlanId || payment.purchasedPlanId || null,
      payload: {
        amount: payment.amount,
        status: result.status,
        gatewayOrderStatus: result.gatewayOrderStatus,
      },
      error: null,
      ip: clientIp,
    });

    return successResponse(res, message, {
      ...result,
      amount: payment.amount,
    });
  }

  payment = payment.toObject();
  return successResponse(res, "Plan payment status", {
    orderId: payment.orderId,
    amount: payment.amount,
    status: payment.status,
    gatewayTrackingId: payment.gatewayTrackingId,
    purchasedPlanId: payment.purchasedPlanId,
  });
});
