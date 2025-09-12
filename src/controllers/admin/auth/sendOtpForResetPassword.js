const Admin = require("../../../models_old/admin");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const sendEmail = require("../../../utils/sendEmail");

exports.sendOtpForResetPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;

  if (!email) return next(new AppError("Email is required", 400));

  const admin = await Admin.findOne({ email });
  if (!admin) return next(new AppError("Admin not found", 404));
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  admin.resetOtp = otp;
  admin.resetOtpExpires = Date.now() + 10 * 60 * 1000;
  await admin.save({ validateBeforeSave: false });

  const message = `Your password reset OTP is: ${otp}. It is valid for 10 minutes.`;

  await sendEmail({
    email: admin.email,
    subject: "Your Password Reset OTP",
    message,
  });

  res.status(200).json({
    status: true,
    message: "OTP sent to your email.",
  });
});
