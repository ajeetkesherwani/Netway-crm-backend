const Driver = require("../../../models_old/driver");
const AppError = require("../../../utils/AppError");
const { successResponse } = require("../../../utils/responseHandler");

exports.updateDriverBlockStatus = (async(req, res, next) => {

    const { driverId } = req.params;
    const { isBlocked } = req.body;

    if(!driverId) return next(new AppError("driverId is required",400));
    

     if (typeof isBlocked !== "boolean") {
        return next(new AppError("isBlocked must be true or false", 400));
    }

    const driver = await Driver.findById(driverId);
    if(!driver) return next(new AppError("driver not found", 404));

    driver.isBlocked = isBlocked;

    driver.save();


    successResponse(res, "status update successfully", driver);
});