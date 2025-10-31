const Hardware = require("../../../models/hardware");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");

exports.getHardwareDetails = catchAsync(async (req, res, next) => {

    const { hardwareId } = req.params;
    if (!hardwareId) return next(new AppError("hardwareId is required", 400));


    const hardwareDetails = await Hardware.findById(hardwareId);
    if (!hardwareDetails) return next(new AppError("hardware not found", 404));

    successResponse(res, "hardware Details found successfully", hardwareDetails);

});