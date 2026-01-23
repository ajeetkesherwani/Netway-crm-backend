const catchAsync = require("../../../utils/catchAsync");
const AppError = require("../../../utils/AppError");
const { successResponse } = require("../../../utils/responseHandler");
const PurchasedPlan = require("../../../models/purchasedPlan");
const UserPackage = require("../../../models/userPackage")
const Package = require("../../../models/package");
const User = require("../../../models/user");
const UserWalletHistory = require("../../../models/userWalletHistory");
const { createLog } = require("../../../utils/userLogActivity");
const Payment = require("../../../models/payment");
const Invoice = require("../../../models/invoice");
const mongoose = require("mongoose");

//generate invoice number
const generateInvoiceNumber = async () => {
  const now = new Date();
  const year = now.getFullYear();
  const nextYear = year + 1;

  const financialYear = `${year.toString().slice(-2)}-${nextYear
    .toString()
    .slice(-2)}`;

  const lastInvoice = await Invoice.findOne({
    invoiceNumber: { $regex: `IND/${financialYear}` }
  })
    .sort({ createdAt: -1 })
    .lean();

  let nextNumber = 1000;

  if (lastInvoice?.invoiceNumber) {
    nextNumber = parseInt(lastInvoice.invoiceNumber.split("/").pop()) + 1;
  }

  return `IND/${financialYear}/${nextNumber}`;
};

//generate receipt number
const generateReceiptNo = async () => {
  let receiptNo;
  let exists = true;

  while (exists) {
    const randomFourDigit = Math.floor(1000 + Math.random() * 9000);
    receiptNo = `RCPT-${randomFourDigit}`;

    const paymentExists = await Payment.findOne({ ReceiptNo: receiptNo });
    exists = !!paymentExists;
  }

  return receiptNo;
};

exports.createPurchasedPlan = catchAsync(async (req, res, next) => {
  const purchaser = req.user; // Admin / Reseller / LCO performing the purchase

  const {
    userId,
    userModel = "User",
    packageId,
    amountPaid,
    paymentMethod,
    startDate, // optional
    remarks,
    advanceRenewal,
    isPaymentReceived
  } = req.body;

  const isAdvance = Boolean(advanceRenewal);
  const planStatus = isAdvance ? "pending" : "active";
  const paymentStatus = isPaymentReceived ? "Completed" : "Pending";

  // ---------------- Validation ---------------- //
  if (!userId || !packageId) {
    return next(new AppError("userId, packageId and are required", 400));
  }


  const existingActivePlan = await PurchasedPlan.findOne({
    userId,
    status: "active"
  }).sort({ expiryDate: -1 });

  if (!isAdvance && existingActivePlan) {
    await PurchasedPlan.findByIdAndUpdate(existingActivePlan._id, {
      status: "expired"
    });
  }


  const selectedPackage = await UserPackage.findOne({
    userId,
    packageId,
    status: "active"
  });

  console.log("selected package ", selectedPackage);

  if (!selectedPackage) return next(new AppError("Assigned active package not found", 404));


  // const packagePrice = Number(selectedPackage.basePrice || selectedPackage.offerPrice || 0);
  let packagePrice = 0;

  if (selectedPackage.basePrice && Number(selectedPackage.basePrice) > 0) {
    packagePrice = Number(selectedPackage.basePrice);
  } else if (selectedPackage.offerPrice && Number(selectedPackage.offerPrice) > 0) {
    packagePrice = Number(selectedPackage.offerPrice);
  } else {
    packagePrice = 0;
  }

  // Check if the purchaser has enough wallet balance
  if (purchaser.role === "Reseller" || purchaser.role === "Lco") {
    const walletBalance = purchaser.walletBalance || 0;
    console.log("Purchaser wallet balance:", walletBalance);

    if (walletBalance < packagePrice) {
      return next(new AppError("Insufficient wallet balance in purchaser account", 400));
    }
  }


  // ---------------- Calculate validity ---------------- //
  const validityNumber = selectedPackage.validity.number;
  const validityUnit = selectedPackage.validity.unit.toLowerCase();

  const start = startDate ? new Date(startDate) : new Date();
  const expiry = new Date(start);

  switch (validityUnit) {
    case "day":
      expiry.setDate(expiry.getDate() + validityNumber);
      break;
    case "week":
      expiry.setDate(expiry.getDate() + validityNumber * 7);
      break;
    case "month":
      expiry.setMonth(expiry.getMonth() + validityNumber);
      break;
    case "year":
      expiry.setFullYear(expiry.getFullYear() + validityNumber);
      break;
    default:
      return next(new AppError("Invalid validity unit in package", 400));
  }


  // ---------------- Create Purchased Plan ---------------- //
  const newPurchase = await PurchasedPlan.create({
    userModel,
    userId,
    packageId,
    purchasedByRole: purchaser.role,
    purchasedById: purchaser._id,
    amountPaid: packagePrice,
    paymentMethod,
    purchaseDate: new Date(),
    startDate: start,
    expiryDate: expiry,
    // status: "active",
    status: planStatus,
    advanceRenewal: isAdvance,
    remarks,
    isPaymentReceived,
    paymentDetails: isPaymentReceived
      ? {
        date: req.body.paymentDate ? new Date(req.body.paymentDate) : new Date(),
        method: paymentMethod || "Cash",
        amount: req.body.paymentAmount,
        remark: req.body.paymentRemark || ""
      }
      : null,
  });

  // ---------------- Fetch Target User ---------------- //
  const targetUser = await User.findById(userId);
  if (!targetUser) {
    return next(new AppError("Target user not found", 404));
  }

  //-----------------------paymnet-------------------------//

  const receiptNo = await generateReceiptNo();

  const walletBeforePayment = Number(targetUser.walletBalance || 0);

  const paidAmount = isPaymentReceived
    ? Number(newPurchase.paymentDetails?.amount || 0)
    : 0;

  const walletAfterPayment = walletBeforePayment + paidAmount - packagePrice;

  const payment = await Payment.create({
    ReceiptNo: receiptNo,
    userId,
    totalAmount: walletBeforePayment,
    amountToBePaid: paidAmount,
    dueAmount: walletAfterPayment,
    PaymentDate: new Date(),
    PaymentMode: paymentMethod || "Cash",
    transactionNo: isPaymentReceived ? req.body.transactionNo || "" : null,
    comment: remarks || "Plan purchase payment",
    paymentProof: req.body.paymentProof || null,
    paymentStatus: isPaymentReceived ? "Completed" : "Pending"
  });

  // ---------------- Invoice Payment Status ---------------- //
  let invoicePaymentStatus = "Unpaid";

  if (isPaymentReceived && paidAmount > 0) {
    if (paidAmount < packagePrice) {
      invoicePaymentStatus = "Partial";
    } else if (paidAmount === packagePrice) {
      invoicePaymentStatus = "Paid";
    } else if (paidAmount > packagePrice) {
      invoicePaymentStatus = "ExtraPaid";
    }
  }

  // ---------------- Create Invoice ---------------- //
  const invoiceNumber = await generateInvoiceNumber();

  const invoice = await Invoice.create({
    invoiceNumber,
    userId,
    package: packageId,
    amount: packagePrice,
    paidAmount: paidAmount,
    addedById: purchaser._id,
    addedByType: purchaser.role,
    comment: remarks || "Invoice generated for plan purchase",
    paymentStatus: invoicePaymentStatus
  });

  // ---------------- Create Activity Log ---------------- //

  await createLog({
    userId: userId,
    type: "Plan Purchased",
    description: `Plan purchased: ${selectedPackage.name}`,
    details: {
      packageId: selectedPackage._id,
      packageName: selectedPackage.name,
      amountPaid: amountPaid
    },
    ip: req.ip || req.headers["x-forwarded-for"] || "0.0.0.0",
    addedBy: {
      id: purchaser._id,
      role: purchaser.role || "Admin",
    }
  });

  // ---------------- Manage User Wallet (FINAL & CORRECT) ---------------- //

  // Package price
  const packageAmount = Number(packagePrice);

  // Amount user actually paid (from DB – source of truth)
  // const paidAmount = isPaymentReceived
  //   ? Number(newPurchase.paymentDetails?.amount || 0)
  //   : 0;

  // Get user's current wallet balance
  const currentWallet = Number(targetUser.walletBalance || 0);

  // FINAL WALLET LOGIC
  // newWallet = oldWallet + paid - price
  const newWalletBalance = currentWallet + paidAmount - packageAmount;

  // Update user wallet
  await User.findByIdAndUpdate(userId, {
    walletBalance: newWalletBalance,
  });

  // ---------------- Create User Wallet History ---------------- //

  // Opening balance = wallet before this transaction
  const openingBalance = currentWallet;

  // Closing balance = wallet after this transaction
  const closingBalance = newWalletBalance;

  // Transaction type based on payment
  const transactionType = paidAmount > 0 ? "credit" : "debit";

  // Transfer amount = what user actually paid
  const transferAmount = paidAmount;

  // Save wallet history
  await UserWalletHistory.create({
    userId,
    transactionType,
    openingBalance,
    transferAmount,
    closingBalance,
    purpose: "plan",
    paymentMode: paymentMethod === "Online" ? "onlineTrancation" : "cash",
    paymentDate: new Date(),
    relatedPurchasePlanId: newPurchase._id,
    remark: "Plan purchased",
  });


  // ---------------- Response ---------------- //
  return successResponse(res, "Plan purchased successfully", {
    purchasedPlan: newPurchase,
    walletHistory: {
      openingBalance,
      transferAmount,
      closingBalance,
      transactionType: !isPaymentReceived ? "debit" : "credit",
    },
    payment,
    invoice
  });
});

