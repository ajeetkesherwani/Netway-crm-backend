const UserPackage = require("../../../models/userPackage");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");

exports.updateAssignedPackage = catchAsync(async (req, res, next) => {

  const assignedPackageId = req.params.assignedPackageId;
  const { customPrice, endDate, hasOtt, hasIptv } = req.body;

  // Find the assigned package
  const assignedPackage = await UserPackage.findById(assignedPackageId);
  if (!assignedPackage) {
    return next(new AppError("Assigned package not found", 404));
  }

  // Update fields if provided
  if (customPrice !== undefined) assignedPackage.customPrice = Number(customPrice);
  if (endDate !== undefined) assignedPackage.endDate = endDate;
  if (hasOtt !== undefined) assignedPackage.hasOtt = hasOtt;
  if (hasIptv !== undefined) assignedPackage.hasIptv = hasIptv;

  await assignedPackage.save();

  return successResponse(res, "Assigned package updated successfully", assignedPackage);
});