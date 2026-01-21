const PurchasedPlan = require("../../../models/purchasedPlan");
const { successResponse } = require("../../../utils/responseHandler");
const catchAsync = require("../../../utils/catchAsync");
const AppError = require("../../../utils/AppError");

exports.getCurrentPlan = catchAsync(async (req, res, next) => {
  const userId = req.params.userId;

  if (!userId) {
    return next(new AppError("userId is required", 400));
  }

  // Fetch ALL active purchased plans instead of 1
  const plans = await PurchasedPlan.find({
    userId,
    status: "active"
  })
    .sort({ startDate: -1 }) // latest first
    .populate(
      "packageId",
      "name validity basePrice offerPrice typeOfPlan categoryOfPlan isOtt isIptv"
    );

  if (!plans || plans.length === 0) {
    return next(new AppError("No active purchased plans found", 404));
  }

  // Loop & modify response with renewal logic
  const finalPlans = plans.map(plan => {
    // If plan is not renewed
    if (!plan.isRenewed || !plan.renewals || plan.renewals.length === 0) {
      return {
        ...plan.toObject(),
        latestRenewal: false
      };
    }

    // If renewed → return only latest renewal
    const latestRenewal = plan.renewals
      .sort((a, b) => new Date(b.renewedOn) - new Date(a.renewedOn))[0];

    return {
      _id: plan._id,
      userId: plan.userId,
      packageId: plan.packageId,
      purchasedByRole: plan.purchasedByRole,
      purchasedById: plan.purchasedById,
      purchaseDate: plan.purchaseDate,

      startDate: latestRenewal.previousExpiryDate,
      expiryDate: latestRenewal.newExpiryDate,
      amountPaid: latestRenewal.amountPaid,
      paymentMethod: latestRenewal.paymentMethod,
      transactionId: latestRenewal.transactionId,
      remarks: latestRenewal.remarks,

      isRenewed: true,
      latestRenewal: true
    };
  });

  return successResponse(
    res,
    "All active purchased plans fetched successfully",
    finalPlans
  );
});
