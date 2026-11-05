const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");
const PlanPayment = require("../../../models/planPayment");
const PurchasedPlan = require("../../../models/purchasedPlan");

exports.planPurchase = catchAsync(async (req, res, next) => {
  const { packageId, transactionId } = req.body;
  if (!packageId || !transactionId) {
    return next(new AppError("packageId and transactionId are required", 400));
  }

  const payment = await PlanPayment.findOne({
    userId: req.user._id,
    packageId,
    status: "Paid",
    $or: [{ orderId: transactionId }, { gatewayTrackingId: transactionId }],
  });

  if (!payment?.purchasedPlanId) {
    return next(
      new AppError("A verified CCAvenue payment is required to purchase a plan", 400)
    );
  }

  const purchasedPlan = await PurchasedPlan.findById(payment.purchasedPlanId);
  if (!purchasedPlan) {
    return next(new AppError("Purchased plan was not found", 404));
  }

  return successResponse(res, "Plan payment has already been processed", {
    purchasedPlan,
  });
});
