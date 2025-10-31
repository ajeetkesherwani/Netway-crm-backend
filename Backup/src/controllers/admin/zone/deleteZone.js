const Zone = require("../../../models/zone");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");

exports.deleteZone = catchAsync(async (req, res, next) => {

    const { zoneId } = req.params;
    if (!zoneId) return next(new AppError("zoneId is required", 400));

    const zone = await Zone.findByIdAndDelete(zoneId);
    if (!zone) return next(new AppError("zone not found", 404));

    successResponse(res, "zone deleted successfully", zone);

});