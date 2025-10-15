const Hardware = require("../../../models/hardware");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");

exports.getHardwareList = catchAsync(async (req, res, next) => {

    const hardwareList = await Hardware.find();
    if (!hardwareList) return next(new AppError("hardware not found", 400));

    successResponse(res, "hardwareList found successfully", hardwareList);

});