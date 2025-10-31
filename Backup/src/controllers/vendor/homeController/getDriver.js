const Driver = require("../../../models/driver");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");

exports.getDriver = catchAsync(async(req, res, next) => {

    const drivers = await Driver.find({}, {firstName: 1, lastName: 1 })
    .sort({ createdAt: -1 });

    if(!drivers) return next(new AppError("driver not found", 404));

    const result = drivers.map(driver => ({
        driverId: driver._id,
        Name: `${driver.firstName} ${driver.lastName}`
    }));

    successResponse(res, "All driver found successfully", result);

});