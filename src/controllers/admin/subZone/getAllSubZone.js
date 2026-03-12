const SubZone = require("../../../models/subZone");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");

exports.getAllSubZone = catchAsync(async (req, res, next) => {
    const subZones = await SubZone.find().populate("zoneId", "zoneName");
    if (!subZones) return next(new AppError("subZones not found", 404));
    console.log("subZones =============================>>>>",subZones);
    successResponse(res, "subZones list found successfully", subZones);

});