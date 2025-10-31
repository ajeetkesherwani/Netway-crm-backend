const Driver = require("../../../models_old/driver");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");

exports.getAllDriver = catchAsync(async (req, res, next) => {

    const driver = await Driver.find();
    if (!driver) return next(new AppError("driver not found", 404));

    successResponse(res, "All driver found", driver);

});