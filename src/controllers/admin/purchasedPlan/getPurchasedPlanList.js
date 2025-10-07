const catchAsync = require("../../../utils/catchAsync");
const AppError = require("../../../utils/AppError");
const { successResponse } = require("../../../utils/responseHandler");
const PurchasedPlan = require("../../../models/purchasedPlan");
const Package = require("../../../models/package");

exports.getPurchasedPlanList = catchAsync(async (req, res, next) => {
  const { userId, purchasedByRole, purchasedById, status } = req.query;

  const filter = {};

  if (userId) filter.userId = userId;
  if (purchasedByRole) filter.purchasedByRole = purchasedByRole;
  if (purchasedById) filter.purchasedById = purchasedById;
  if (status) filter.status = status;

  // Auto-update expired plans
  await PurchasedPlan.updateMany(
    { expiryDate: { $lt: new Date() }, status: "active" },
    { $set: { status: "expired" } }
  );

  const plans = await PurchasedPlan.find(filter)
    .populate("packageId", "name validity basePrice offerPrice")
    .populate("userId", "name email mobileNo") // adjust fields as per actual user model
    .sort({ createdAt: -1 });

  successResponse(res, "Purchased plan list fetched successfully", plans);
});
