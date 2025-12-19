const SubZone = require("../../../models/subZone");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");

exports.updateSubzone = catchAsync(async (req, res, next) => {
  const { subzoneId } = req.params;
  if (!subzoneId) return next(new AppError("subzoneId is required", 400));

  const { name, zoneId } = req.body;

  const subzone = await SubZone.findById(subzoneId);
  if (!subzone) return next(new AppError("SubZone not found", 404));

  subzone.name = name || subzone.name;
  subzone.zoneId = zoneId || subzone.zoneId;
  await subzone.save();

  successResponse(res, "SubZone updated successfully", subzone);
});
