const PurchasedPlan = require("../../../models/purchasedPlan");
const catchAsync = require("../../../utils/catchAsync");
const AppError = require("../../../utils/AppError");
const { successResponse } = require("../../../utils/responseHandler");
const { createLog } = require("../../../utils/userLogActivity");

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
  const previousPlan = {
    status: purchasedPlan.status,
    startDate: purchasedPlan.startDate,
    expiryDate: purchasedPlan.expiryDate,
    amountPaid: purchasedPlan.amountPaid,
    paymentMethod: purchasedPlan.paymentMethod,
    packageId: purchasedPlan.packageId,
  };

  // Apply updates if fields are provided
  if (status) purchasedPlan.status = status;
  if (startDate) purchasedPlan.startDate = new Date(startDate);
  if (expiryDate) purchasedPlan.expiryDate = new Date(expiryDate);
  if (amountPaid !== undefined) purchasedPlan.amountPaid = amountPaid;
  if (paymentMethod) purchasedPlan.paymentMethod = paymentMethod;
  if (packageId) purchasedPlan.packageId = packageId;

  await purchasedPlan.save();

  await createLog({
    userId: purchasedPlan.userId,
    type: "Purchased Plan Updated",
    description: `Purchased plan ${purchasedPlan._id} updated for customer ${purchasedPlan.userId}`,
    details: {
      planId: purchasedPlan._id,
      customerId: purchasedPlan.userId,
      before: previousPlan,
      after: {
        status: purchasedPlan.status,
        startDate: purchasedPlan.startDate,
        expiryDate: purchasedPlan.expiryDate,
        amountPaid: purchasedPlan.amountPaid,
        paymentMethod: purchasedPlan.paymentMethod,
        packageId: purchasedPlan.packageId,
      },
      updatedById: req.user._id,
      updatedByRole: req.user.role,
    },
    addedBy: { id: req.user._id, role: req.user.role || "Admin" },
    ip: req.ip || req.headers["x-forwarded-for"],
    module: "purchased-plan",
    targetType: "purchasedPlan",
    targetId: purchasedPlan._id,
  });

  successResponse(res, "Purchased plan updated successfully", purchasedPlan);
});
