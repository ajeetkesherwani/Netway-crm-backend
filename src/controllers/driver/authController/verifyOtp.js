const Driver = require("../../../models/driver");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const createToken = require("../../../utils/createToken");

exports.verifyOtp = catchAsync(async(req, res, next) => {

    const { mobile, otp } = req.body;
    if (!mobile || !otp) return next(new AppError("mobile and otp is required", 400));

    const driver = await Driver.findOne({ mobile });
    if (!driver) return next(new AppError("Driver not found with this is mobile number", 404));

    if (!driver.status) {
        return next(new AppError("you are not verify. wait for verification", 400));
    }

    if (driver.isBlocked) {
        return next(new AppError("you are blocked", 400));
    }

    if (!driver.otp || !driver.otpExpire) {
        return next(new AppError("OTP not found or expired.", 401));
    }

    if (driver.otp !== otp) {
        return next(new AppError("Invalid OTP.", 401));
    }

    if(new Date() > driver.otpExpire) {
        return next(new AppError("OTP has expired.", 401));
    }

    driver.otp = undefined;
    driver.otpExpire = undefined;

    await driver.save();

   createToken(driver, 200, res);
  
});