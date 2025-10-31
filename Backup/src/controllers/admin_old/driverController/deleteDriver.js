const Driver = require("../../../models_old/driver");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");

exports.deleteDriver = catchAsync(async(req, res, next) => {

    const { driverId } = req.params;
    if(!driverId) return next (new AppError("driverId is required", 400));

     const deletedDriver = await Driver.findByIdAndDelete({ _id: driverId });
    if(!deletedDriver) return next(new AppError("driver not found", 404));

    successResponse(res, "Driver deleted successfully", deletedDriver);

});