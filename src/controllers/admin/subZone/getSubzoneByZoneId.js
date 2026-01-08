const SubZone = require("../../../models/subZone");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");

exports.getSubzoneListByZoneId = catchAsync(async (req, res, next) => {
  const { zoneId } = req.params;

  if (!zoneId) {
    return next(new AppError("zoneId is required", 400));
  }

  const subZones = await SubZone.find({ zoneId }).sort({ createdAt: -1 });

  if (!subZones.length) {
    return next(new AppError("No subzones found for this zone", 404));
  }

  return successResponse(  res, "Subzones retrieved successfully", subZones );
});
