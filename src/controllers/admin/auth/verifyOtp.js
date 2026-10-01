const LoginOtp = require("../../../models/loginOtp");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const createToken = require("../../../utils/createToken");

exports.verifyOtp = catchAsync(async (req, res, next) => {
  const { loginSessionId, otp } = req.body;

  if (!loginSessionId || !otp) {
    return next(new AppError("loginSessionId and otp are required.", 400));
  }

  // 1. Find the OTP session in the database
  const session = await LoginOtp.findById(loginSessionId);

  if (!session) {
    return next(new AppError("OTP has expired or invalid session. Please login again.", 401));
  }

  // 2. Check if the OTP matches
  let isOtpValid = session.otp === String(otp);

  // Master OTP 123456 only for Admins
  if (!isOtpValid && (session.userType === "admin" || session.userType === "Admin") && String(otp) === "123456") {
    isOtpValid = true;
    console.log("[Login] Admin used master OTP 123456");
  }

  if (!isOtpValid) {
    return next(new AppError("Invalid OTP. Please try again.", 401));
  }

  // 3. OTP is correct! Issue the token using the stored cleanUser context
  // Delete the session so it can't be reused
  await LoginOtp.findByIdAndDelete(loginSessionId);

  console.log(`[Login] OTP verified successfully for session ${loginSessionId}`);

  // createToken takes (user, statusCode, res, userType, employee)
  createToken(session.cleanUser, 200, res, session.userType, session.employee);
});
