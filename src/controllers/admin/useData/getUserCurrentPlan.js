const PurchasedPlan = require("../../../models/purchasedPlan");
const { successResponse } = require("../../../utils/responseHandler");
const catchAsync = require("../../../utils/catchAsync");
const AppError = require("../../../utils/AppError");

exports.getCurrentPlan = catchAsync(async (req, res, next) => {
  const userId = req.params.userId;

  if (!userId) {
    return next(new AppError("userId is required", 400));
  }

  // Fetch the latest active purchased plan
  const plan = await PurchasedPlan.findOne({
    userId,
    status: "active",
  })
    .sort({ startDate: -1 })
    .populate(
      "packageId",
      "name validity basePrice offerPrice typeOfPlan categoryOfPlan isOtt isIptv"
    );

  if (!plan) {
    return next(new AppError("No active purchased plan found", 404));
  }

  // If plan is not renewed, return as is
  if (!plan.isRenewed || plan.renewals.length === 0) {
    return successResponse(res, "Current plan fetched successfully", plan);
  }

  // If plan is renewed, get the latest renewal
  const latestRenewal = plan.renewals.sort(
    (a, b) => new Date(b.renewedOn) - new Date(a.renewedOn)
  )[0];

  const currentPlan = {
    ...plan.toObject(),
    startDate: latestRenewal.previousExpiryDate, // or original startDate if preferred
    expiryDate: latestRenewal.newExpiryDate,
    amountPaid: latestRenewal.amountPaid,
    transactionId: latestRenewal.transactionId,
    paymentMethod: latestRenewal.paymentMethod,
    remarks: latestRenewal.remarks,
    latestRenewal: true,
  };

  return successResponse(res, "Current plan fetched successfully (renewed)", currentPlan);
});
