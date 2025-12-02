const PurchasedPlan = require("../../../models/purchasedPlan");
const catchAsync = require("../../../utils/catchAsync");
const AppError = require("../../../utils/AppError");
const { successResponse } = require("../../../utils/responseHandler");

exports.updatePurchasedPlan = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const {
    status,
    startDate,
    expiryDate,
    amountPaid,
    paymentMethod,
    packageId
  } = req.body;

  const purchasedPlan = await PurchasedPlan.findById(id);
  if (!purchasedPlan) {
    return next(new AppError("Purchased plan not found", 404));
  }

  // Apply updates if fields are provided
  if (status) purchasedPlan.status = status;
  if (startDate) purchasedPlan.startDate = new Date(startDate);
  if (expiryDate) purchasedPlan.expiryDate = new Date(expiryDate);
  if (amountPaid !== undefined) purchasedPlan.amountPaid = amountPaid;
  if (paymentMethod) purchasedPlan.paymentMethod = paymentMethod;
  if (packageId) purchasedPlan.packageId = packageId;

  await purchasedPlan.save();

  successResponse(res, "Purchased plan updated successfully", purchasedPlan);
});
