const Driver = require("../../../models_old/driver");
const AppError = require("../../../utils/AppError");
const { successResponse } = require("../../../utils/responseHandler");

exports.updateDriverStatus = (async(req, res, next) => {

    const { driverId } = req.params;
    const { status } = req.body;

    if(!driverId) return next(new AppError("driverId is required",400));
    if(!status) return next(new AppError("status is required", 400));

    const driver = await Driver.findById(driverId);
    if(!driver) return next(new AppError("driver not found", 404));

    driver.status = status;

    driver.save();


    successResponse(res, "status update successfully", driver);
});