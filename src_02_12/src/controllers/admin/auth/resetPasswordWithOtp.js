const bcrypt = require("bcrypt");
const catchAsync = require("../../../utils/catchAsync");
const AppError = require("../../../utils/AppError");
const Admin = require("../../../models_old/admin");

exports.resetPasswordWithOtp = catchAsync(async (req, res, next) => {
  console.log(req.body);
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword) {
    return next(new AppError("Email, OTP and new password are required", 400));
  }

  const admin = await Admin.findOne({ email });

  if (
    !admin ||
    admin.resetOtp !== otp ||
    !admin.resetOtpExpires ||
    admin.resetOtpExpires < Date.now()
  ) {
    return next(new AppError("Invalid or expired OTP", 400));
  }

  console.log(newPassword);

  // Set new password
  admin.password = await bcrypt.hash(newPassword, 12);
  admin.resetOtp = undefined;
  admin.resetOtpExpires = undefined;
  await admin.save();

  res.status(200).json({
    status: true,
    message: "Password reset successfully.",
  });
});
