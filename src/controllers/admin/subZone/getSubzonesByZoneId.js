const { default: mongoose } = require("mongoose");
const SubZone = require("../../../models/subZone");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");

exports.getSubzonesByZoneId = catchAsync(async (req, res, next) => {
  const { zoneId } = req.params;

  if (!zoneId) return next(new AppError("zoneId is required", 400));
  if (!mongoose.Types.ObjectId.isValid(zoneId)) {
    throw next(new AppError("Invalid zoneId", 400));
  }

  const subZones = await SubZone.find({
    zoneId,
    status: "active",
  }).select("name -_id");

  if (!subZones) return next(new AppError("subZones not found", 404));

  const subZoneNames = subZones.map((subZone) => subZone.name);

  successResponse(res, "subZones list found successfully", subZoneNames);
});
