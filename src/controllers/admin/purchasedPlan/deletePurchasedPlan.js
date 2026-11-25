const PurchasedPlan = require("../../../models/purchasedPlan");
const catchAsync = require("../../../utils/catchAsync");
const AppError = require("../../../utils/AppError");
const { successResponse } = require("../../../utils/responseHandler");
const { createLog } = require("../../../utils/userLogActivity");

exports.deletePurchasedPlan = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const purchasedPlan = await PurchasedPlan.findById(id);
  if (!purchasedPlan) {
    return next(new AppError("Purchased plan not found", 404));
  }

  const deletedPlan = await PurchasedPlan.findByIdAndDelete(id);
  if (!deletedPlan) {
    return next(new AppError("Purchased plan not found", 404));
  }
  await createLog({
    userId: purchasedPlan.userId,
    type: "Purchased Plan Deleted",
    description: `Purchased plan ${purchasedPlan._id} deleted for customer ${purchasedPlan.userId}`,
    details: {
      planId: purchasedPlan._id,
      customerId: purchasedPlan.userId,
      packageId: purchasedPlan.packageId,
      status: purchasedPlan.status,
      amountPaid: purchasedPlan.amountPaid,
      paymentMethod: purchasedPlan.paymentMethod,
      startDate: purchasedPlan.startDate,
      expiryDate: purchasedPlan.expiryDate,
      deletedById: req.user._id,
      deletedByRole: req.user.role,
    },
    addedBy: { id: req.user._id, role: req.user.role || "Admin" },
    ip: req.ip || req.headers["x-forwarded-for"],
    module: "purchased-plan",
    targetType: "purchasedPlan",
    targetId: purchasedPlan._id,
  });

  successResponse(res, "Purchased plan deleted successfully");
});
