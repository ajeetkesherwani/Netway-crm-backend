const Driver = require("../../../models/driver");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");

exports.sendOtp = catchAsync(async (req, res, next) => {

    let { mobile } = req.body;
    if (!mobile) return next(new AppError("mobile is required", 400));

    const driver = await Driver.findOne({ mobile });
    if (!driver) return next(new AppError("Driver not registerd", 400));

    if (!driver.status) return next(
        new AppError("You are not verified. wait for verification", 403)
    );

    if (driver.isBlocked) return next(new AppError("you are blocked", 403));

    const otp = "1234";
    driver.otp = otp;
    driver.otpExpire = Date.now() + 10 * 60 * 1000;
    await driver.save();

    // res.status(200).json({ status: true, message: "otp generate successfully", otp })
    successResponse(res, "otp generate successfully", otp);

});