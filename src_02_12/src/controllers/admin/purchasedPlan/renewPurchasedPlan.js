const catchAsync = require("../../../utils/catchAsync");
const AppError = require("../../../utils/AppError");
const { successResponse } = require("../../../utils/responseHandler");
const PurchasedPlan = require("../../../models/purchasedPlan");
const Package = require("../../../models/package");

exports.renewPurchasedPlan = catchAsync(async (req, res, next) => {
  const user = req.user; // Authenticated user (Admin/Reseller/LCO)
  const {
    planId,           // Existing plan ID to renew
    amountPaid,
    paymentMethod = "Online",
    remarks = "",
    transactionId
  } = req.body;

  if (!planId || !amountPaid) {
    return next(new AppError("planId and amountPaid are required", 400));
  }

  // 1️⃣ Find the existing plan
  const plan = await PurchasedPlan.findById(planId).populate("packageId");
  if (!plan) return next(new AppError("Plan not found", 404));

  // 2️⃣ Check status eligibility
  if (plan.status === "cancelled") {
    return next(new AppError("Cancelled plan cannot be renewed", 400));
  }

  const selectedPackage = plan.packageId;
  if (!selectedPackage) return next(new AppError("Package details not found", 404));

  // 3️⃣ Calculate new expiry date based on package validity
  const validityNumber = selectedPackage.validity.number;
  const validityUnit = selectedPackage.validity.unit.toLowerCase();

  const previousExpiry = new Date(plan.expiryDate);
  const newExpiry = new Date(previousExpiry); // extend from existing expiry

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
      return next(new AppError("Invalid validity unit in package", 400));
  }

  // 4️⃣ Push renewal history
  plan.renewals.push({
    renewedOn: new Date(),
    previousExpiryDate: previousExpiry,
    newExpiryDate: newExpiry,
    amountPaid,
    transactionId,
    paymentMethod,
    remarks
  });

  // 5️⃣ Update main plan fields
  plan.expiryDate = newExpiry;
  plan.isRenewed = true;
  plan.amountPaid += amountPaid; // optional: keep cumulative total
  plan.status = "active";

  await plan.save();

  successResponse(res, "Plan renewed successfully", plan);
});
