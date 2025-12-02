// const PurchasedPlan = require("../../../models/purchasedPlan");
// const { successResponse } = require("../../../utils/responseHandler");
// const catchAsync = require("../../../utils/catchAsync.js");
// const AppError = require("../../../utils/AppError.js");

// exports.getCurrentPlan = catchAsync(async (req, res, next) => {


//     const userId = req.params.userId

//     if (!userId) {
//       return next(new AppError("userId is required", 400));
//     }

//     const plan = await PurchasedPlan.findOne({
//       userId,
//       status: "Active",
//     }).sort({ startDate: -1 });

//     if (!plan) {
//    return next(new AppError("No active plan", 400));
//     }

//     return successResponse(res, "Current plan fetched successfully", plan);
 
// });
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

  // Determine the current plan: original plan or latest renewal
  let currentPlan = plan.toObject();

  if (plan.isRenewed && plan.renewals.length > 0) {
    // Sort renewals by renewedOn descending and get the latest
    const latestRenewal = plan.renewals.sort(
      (a, b) => new Date(b.renewedOn) - new Date(a.renewedOn)
    )[0];

    // Merge latest renewal info into the plan object
    currentPlan = {
      ...currentPlan,
      startDate: latestRenewal.previousExpiryDate,
      expiryDate: latestRenewal.newExpiryDate,
      amountPaid: latestRenewal.amountPaid,
      transactionId: latestRenewal.transactionId,
      paymentMethod: latestRenewal.paymentMethod,
      remarks: latestRenewal.remarks,
      latestRenewal: true,
    };
  } else {
    currentPlan.latestRenewal = false;
  }

  return successResponse(res, "Current plan fetched successfully", currentPlan);
});
