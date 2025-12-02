const Zone = require("../../../models/zone");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");

exports.updateZone = catchAsync(async (req, res, next) => {

    const { zoneId } = req.params;
    if (!zoneId) return next(new AppError("zoneId is required", 400));

    const { zoneName } = req.body;


    const zone = await Zone.findById(zoneId);
    if (!zone) return next(new AppError("Zone not found", 404));


    zone.zoneName = zoneName || zone.zoneName;

    await zone.save();

    successResponse(res, "Zone updated successfully", zone);

});
