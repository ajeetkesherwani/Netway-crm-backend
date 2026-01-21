const catchAsync = require("../../../utils/catchAsync");
const AppError = require("../../../utils/AppError");
const { successResponse } = require("../../../utils/responseHandler");
const PurchasedPlan = require("../../../models/purchasedPlan");
const Package = require("../../../models/package");
const UserWalletHistory  = require("../../../models/userWalletHistory");
const createLog = require("../../../utils/createLog");
const User = require("../../../models/user");
const Payment = require("../../../models/payment");

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


exports.renewPurchasedPlan = catchAsync(async (req, res, next) => {
  const purchaser = req.user;
  const planId = req.params.id;

  const {
    amountPaid,
    paymentMethod = "Online",
    remarks = "",
    transactionId,
    paymentDate,
    paymentAmount,
    paymentRemark = "",
    isPaymentReceived
  } = req.body;

  console.log(req.body, "req.body");


  if (!planId || !amountPaid) {
    return next(new AppError("planId and amountPaid are required", 400));
  }

  // 1️⃣ Find plan
  const plan = await PurchasedPlan.findById(planId).populate("packageId");
  if (!plan) return next(new AppError("Plan not found", 404));

  if (plan.status === "cancelled") {
    return next(new AppError("Cancelled plan cannot be renewed", 400));
  }

  const selectedPackage = plan.packageId;
  if (!selectedPackage) {
    return next(new AppError("Package details not found", 404));
  }

  // 2️⃣ Calculate new expiry
  const validityNumber = selectedPackage.validity.number;
  const validityUnit = selectedPackage.validity.unit.toLowerCase();

  const previousExpiry = new Date(plan.expiryDate);
  const newExpiry = new Date(previousExpiry);

  switch (validityUnit) {
    case "day":
      newExpiry.setDate(newExpiry.getDate() + validityNumber);
      break;
    case "week":
      newExpiry.setDate(newExpiry.getDate() + validityNumber * 7);
      break;
    case "month":
      newExpiry.setMonth(newExpiry.getMonth() + validityNumber);
      break;
    case "year":
      newExpiry.setFullYear(newExpiry.getFullYear() + validityNumber);
      break;
    default:
      return next(new AppError("Invalid validity unit", 400));
  }


  // 3️⃣ Push renewal history
  plan.renewals.push({
    renewedOn: new Date(),
    previousExpiryDate: previousExpiry,
    newExpiryDate: newExpiry,
    amountPaid: Number(amountPaid),
    transactionId,
    paymentMethod,
    remarks,
    status: "pending",       
  advanceRenewal: true, 
    isPaymentReceived,
    ...(isPaymentReceived && {
      paymentDetails: {
        date: paymentDate ? new Date(paymentDate) : new Date(),
        method: paymentMethod,
        amount: req.body.paymentAmount, 
        remark: paymentRemark
      }
    })
  });

  // 4️⃣ Update main plan
  // plan.expiryDate = newExpiry;
  plan.isRenewed = true;
  plan.amountPaid += Number(amountPaid);
  // plan.status = "active";
  plan.isPaymentReceived = isPaymentReceived;

  await plan.save();

// ---------------- Wallet Handling ---------------- //

// Package price (renew price = package base/offer price)
const packageAmount = Number(
  selectedPackage.basePrice ||
  selectedPackage.offerPrice ||
  0
);

// Paid amount = paymentDetails.amount (SOURCE OF TRUTH)
const paidAmount = isPaymentReceived
  ? Number(
      plan.renewals[plan.renewals.length - 1]?.paymentDetails?.amount || 0
    )
  : 0;

// Get user
const user = await User.findById(plan.userId);
const currentWallet = Number(user.walletBalance || 0);

// FINAL WALLET LOGIC (DO NOT CHANGE)
const newWalletBalance = currentWallet + paidAmount - packageAmount;

// ---------------- Create Payment for Renewal ---------------- //

const receiptNo = await generateReceiptNo();

const walletBeforePayment = currentWallet;
const walletAfterPayment = newWalletBalance;

const payment = await Payment.create({
  ReceiptNo: receiptNo,
  userId: plan.userId,

  // wallet snapshot
  totalAmount: walletBeforePayment,
  amountToBePaid: paidAmount,
  dueAmount: walletAfterPayment,

  PaymentDate: paymentDate ? new Date(paymentDate) : new Date(),
  PaymentMode: paymentMethod || "Online",
  transactionNo: isPaymentReceived ? transactionId || "" : null,
  comment: remarks || "Plan renewal payment",
  paymentProof: null,

  paymentStatus: isPaymentReceived ? "Completed" : "Pending"
});


// Update wallet
await User.findByIdAndUpdate(plan.userId, {
  walletBalance: newWalletBalance,
});

// ---------------- Wallet History ---------------- //

const openingBalance = currentWallet;
const closingBalance = newWalletBalance;

// transactionType based on payment
const transactionType = paidAmount > 0 ? "credit" : "debit";

// transferAmount = what user actually paid
const transferAmount = paidAmount;

await UserWalletHistory.create({
  userId: plan.userId,
  transactionType,
  openingBalance,
  transferAmount,
  closingBalance,
  purpose: "plan renewal",
  paymentMode: paymentMethod === "Online" ? "onlineTrancation" : "cash",
  paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
  relatedPurchasePlanId: plan._id,
  remark: "Plan renewed",
});

  // 7️⃣ Activity log
  await createLog({
    userId: plan.userId,
    type: "Plan Renewed",
    description: `Plan renewed: ${selectedPackage.name}`,
    details: {
      planId: plan._id,
      amountPaid
    },
    ip: req.ip || "0.0.0.0",
    addedBy: {
      id: purchaser._id,
      role: purchaser.role
    }
  });

  return successResponse(res, "Plan renewed successfully",
    {
      plan,
      payment
    }
    );
});
