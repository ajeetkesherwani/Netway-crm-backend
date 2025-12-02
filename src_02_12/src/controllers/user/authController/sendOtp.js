const User = require("../../../models/user");

// Generate a 6-digit OTP
const generateOTP = () => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

// Send OTP to mobile number
const sendOtp = async (req, res) => {
  try {
    const { mobileNo } = req.body;

    if (!mobileNo) {
      return res.status(400).json({ success: false, message: "Mobile number is required" });
    }

    let user = await User.findOne({ "generalInformation.phone": mobileNo });
    if (!user) {
      return res.status(400).json({ success: false, message: "User not found!" });
    }

    // Generate OTP
    // const otp = generateOTP();
    const otp = "1234";
    const otpExpiry = new Date();
    otpExpiry.setMinutes(otpExpiry.getMinutes() + 10); // OTP valid for 10 minutes

    // Update OTP in existing user
    user.generalInformation.otp = {
      code: otp,
      expiresAt: otpExpiry,
    };

    await user.save();

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully",
      otp, // Remove this in production, send via SMS instead
    });
  } catch (error) {
    console.error("Error in sendOtp controller:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};


module.exports = sendOtp;
