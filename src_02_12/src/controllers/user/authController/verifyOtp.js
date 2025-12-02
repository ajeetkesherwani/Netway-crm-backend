const User = require("../../../models/user");
const createToken = require("../../../utils/createToken");

exports.verifyOtp = async (req, res) => {
  try {
    const { mobileNo, otp, deviceInfo } = req.body;

    if (!mobileNo || !otp) {
      return res.status(400).json({
        success: false,
        message: "Mobile number and OTP are required",
      });
    }

    const user = await User.findOne({ "generalInformation.phone": mobileNo }).select("generalInformation.name generalInformation.phone generalInformation.email generalInformation.otp");
    if (!user) {
      return res.status(400).json({ success: false, message: "User not found!" });
    }

    if (!user.generalInformation.otp || user.generalInformation.otp.code !== otp) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    if (user.generalInformation.otp.expiresAt < new Date()) {
      return res.status(400).json({ success: false, message: "OTP has expired" });
    }

    // Clear OTP after verification
    user.generalInformation.otp = undefined;
    await user.save();

    // Generate and send token with user info
    return createToken(user, 200, res);
  } catch (error) {
    console.error("Error in verifyOtp controller:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

