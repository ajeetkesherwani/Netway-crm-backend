const Zone = require("../../../models/zone");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");

exports.getZoneList = catchAsync(async (req, res, next) => {

    const zone = await Zone.find();
    if (!zone) return next(new AppError("zone not found", 404));

    successResponse(res, "zone list found successfully", zone);

});