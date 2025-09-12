const User = require("../../../models/user");
const createToken = require("../../../utils/createToken");

exports.verifyOtp = async (req, res) => {
  try {
    const { mobileNo, otp, deviceInfo } = req.body;

    if (!mobileNo || !otp)
      return res
        .status(400)
        .json({
          success: false,
          message: "Mobile number and OTP are required",
        });

    const user = await User.findOne({ mobileNo });

    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    if (!user.otp || !user.otp.code || user.otp.code !== otp)
      return res.status(400).json({ success: false, message: "Invalid OTP" });

    if (user.otp.expiresAt < new Date())
      return res
        .status(400)
        .json({ success: false, message: "OTP has expired" });

    user.isVerified = true;
    user.lastLogin = new Date();

    // Optionally save device info
    // if (deviceInfo) user.deviceInfo = deviceInfo;

    user.otp = undefined;

    await user.save();

    // Generate and send token with user info
    return createToken(user, 200, res);
  } catch (error) {
    console.error("Error in verifyOtp controller:", error);
    return res
      .status(500)
      .json({
        status: false,
        message: "Internal server error",
        error: error.message,
      });
  }
};
