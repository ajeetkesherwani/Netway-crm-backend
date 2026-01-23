const catchAsync = require("../../../utils/catchAsync");
const AppError = require("../../../utils/AppError");
const { successResponse } = require("../../../utils/responseHandler");
const PurchasedPlan = require("../../../models/purchasedPlan");
const User = require("../../../models/user");
const Retailer = require("../../../models/retailer");
const Lco = require("../../../models/lco");
const UserWalletHistory = require("../../../models/userWalletHistory");
const { createLog } = require("../../../utils/userLogActivity");

exports.refundPurchasedPlan = catchAsync(async (req, res, next) => {

  const { planId } = req.params;

  const requester = req.user;

  // Fetch plan
 
  const plan = await PurchasedPlan.findById(planId)
    .populate("userId")
    .populate("packageId");
    // console.log(plan, "plans");

  if (!plan) {
    return next(new AppError("Purchased plan not found", 404));
  }

  const endUser = plan.userId;
  console.log("endUser", endUser);


  // Decide refund source
  let refundBaseAmount;
  let refundStartDate;
  let refundLabel = "purchase";

  if (plan.isRenewed && plan.renewals.length > 0) {
    const latestRenewal = plan.renewals[plan.renewals.length - 1];

    if (latestRenewal.status !== "active") {
      return next(
        new AppError("Latest renewal is not active, cannot refund", 400)
      );
    }

    refundBaseAmount = latestRenewal.amountPaid;
    refundStartDate = latestRenewal.renewedOn;
    refundLabel = "renewal";
  } else {
    if (plan.status !== "active") {
      return next(new AppError("Only active plans can be refunded", 400));
    }

    refundBaseAmount = plan.amountPaid;
    refundStartDate = plan.startDate;
  }

  //  Calculate used days & refund

  const MS_PER_DAY = 24 * 60 * 60 * 1000;
  let usedDays = Math.max(
    1,
    Math.ceil((Date.now() - new Date(refundStartDate)) / MS_PER_DAY)
  );

  let totalDays = plan.packageId.validity.number;
  const unit = plan.packageId.validity.unit.toLowerCase();
  if (unit === "week") totalDays *= 7;
  if (unit === "month") totalDays *= 30;
  if (unit === "year") totalDays *= 365;

//   const refundAmount =
//     refundBaseAmount - usedDays * (refundBaseAmount / totalDays);

const perDayCost = refundBaseAmount / totalDays;
let refundAmount;

// ADMIN REFUND RULE (ONLY ADMIN PANEL)
if (usedDays <= 5) {
  // Full refund if refunded within 5 days
  refundAmount = refundBaseAmount;
} else {
  // After 5 days → cut per-day cost from day 1
  refundAmount = refundBaseAmount - usedDays * perDayCost;
}


  if (refundAmount <= 0) {
    return next(new AppError("No refundable amount left", 400));
  }


  //  Decide refund wallet owner (CORE FIX)

  const createdFor = endUser.generalInformation?.createdFor;

if (createdFor?.type === "Admin") {
  // Admin-created user → refund goes to SAME USER
  refundWalletDoc = endUser; 
  refundWalletType = "User";
}
else if (createdFor?.type === "Retailer") {
  refundWalletDoc = await Retailer.findById(createdFor.id);
  refundWalletType = "Retailer";
}
else if (createdFor?.type === "Lco") {
  refundWalletDoc = await Lco.findById(createdFor.id);
  refundWalletType = "LCO";
}

  // Wallet update (ONLY ONE WALLET)

  const openingBalance = refundWalletDoc.walletBalance || 0;
  refundWalletDoc.walletBalance = openingBalance + refundAmount;
  await refundWalletDoc.save();


  //  Wallet history (SINGLE ENTRY)

  await UserWalletHistory.create({
    userId: refundWalletDoc._id,
    transactionType: "credit",
    openingBalance,
    transferAmount: refundAmount,
    closingBalance: refundWalletDoc.walletBalance,
    purpose: "plan-refund",
    relatedPurchasePlanId: plan._id,
    remark: `Refund credited to ${refundWalletType} wallet`
  });

 
  //  Update plan status
 
  plan.status = "refund";
  plan.isRefundable = false;
  plan.refundRequestedAt = new Date();
  plan.refundedAt = new Date();

  if (refundLabel === "renewal") {
    plan.renewals[plan.renewals.length - 1].status = "refund";
  }

  await plan.save();


  //  Activity log

  await createLog({
    userId: endUser._id,
    type: "Plan Refunded",
    description: `Plan ${refundLabel} refunded`,
    details: {
      planId: plan._id,
      refundAmount,
      usedDays,
      refundType: refundLabel,
      creditedTo: refundWalletType
    },
    ip: req.ip || "0.0.0.0",
    addedBy: {
      id: requester._id,
      role: requester.role
    }
  });

  return successResponse(res, "Plan refunded successfully", {
    refundAmount,
    usedDays,
    refundType: refundLabel,
    creditedTo: refundWalletType
  });
});



