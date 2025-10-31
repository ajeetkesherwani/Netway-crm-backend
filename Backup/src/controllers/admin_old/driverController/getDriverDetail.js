const Driver = require("../../../models_old/driver");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");

exports.getDriverDetail = catchAsync(async (req, res, next) => {

    const { driverId } = req.params;
    if (!driverId) return next(new AppError("driverId is required", 400));

    const raw = await Driver.findById(driverId);

    console.log("driverId", driverId)
    const driverDetail = await Driver.findById(driverId)
        .populate("details")
        .populate("accounts");
    if (!driverDetail) return next(new AppError("driver not found", 404));

    successResponse(res, "Driver details", driverDetail);

});