const UserPackage = require("../../../models/userPackage");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");
const { createLog } = require("../../../utils/userLogActivity");

exports.updateAssignedPackage = catchAsync(async (req, res, next) => {

  const assignedPackageId = req.params.assignedPackageId;
  const { customPrice, endDate, hasOtt, hasIptv } = req.body;

  // Find the assigned package
  const assignedPackage = await UserPackage.findById(assignedPackageId);
  if (!assignedPackage) {
    return next(new AppError("Assigned package not found", 404));
  }
  const previousValues = {
    customPrice: assignedPackage.customPrice,
    endDate: assignedPackage.endDate,
    hasOtt: assignedPackage.hasOtt,
    hasIptv: assignedPackage.hasIptv,
  };

  // Update fields if provided
  if (customPrice !== undefined) assignedPackage.customPrice = Number(customPrice);
  if (endDate !== undefined) assignedPackage.endDate = endDate;
  if (hasOtt !== undefined) assignedPackage.hasOtt = hasOtt;
  if (hasIptv !== undefined) assignedPackage.hasIptv = hasIptv;

  await assignedPackage.save();

  await createLog({
    userId: assignedPackage.userId,
    type: "Assigned Package Updated",
    description: `Assigned package ${assignedPackage.packageName} updated for customer ${assignedPackage.userId}`,
    details: {
      assignmentId: assignedPackage._id,
      customerId: assignedPackage.userId,
      packageId: assignedPackage.packageId,
      packageName: assignedPackage.packageName,
      before: previousValues,
      after: {
        customPrice: assignedPackage.customPrice,
        endDate: assignedPackage.endDate,
        hasOtt: assignedPackage.hasOtt,
        hasIptv: assignedPackage.hasIptv,
      },
      updatedById: req.user._id,
      updatedByRole: req.user.role,
    },
    addedBy: { id: req.user._id, role: req.user.role || "Admin" },
    ip: req.ip || req.headers["x-forwarded-for"],
    module: "package-assignment",
    targetType: "userPackage",
    targetId: assignedPackage._id,
    targetName: assignedPackage.packageName,
  });

  return successResponse(res, "Assigned package updated successfully", assignedPackage);
});