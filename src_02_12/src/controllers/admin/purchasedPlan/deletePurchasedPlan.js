const PurchasedPlan = require("../../../models/purchasedPlan");
const catchAsync = require("../../../utils/catchAsync");
const AppError = require("../../../utils/AppError");
const { successResponse } = require("../../../utils/responseHandler");

exports.deletePurchasedPlan = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const purchasedPlan = await PurchasedPlan.findById(id);
  if (!purchasedPlan) {
    return next(new AppError("Purchased plan not found", 404));
  }

  await PurchasedPlan.findByIdAndDelete(id);

  successResponse(res, "Purchased plan deleted successfully");
});
