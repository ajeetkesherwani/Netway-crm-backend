const User = require("../../../models/user");

// Generate a 6-digit OTP
const generateOTP = () => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

// Send OTP to mobile number
const sendOtp = async (req, res) => {
  try {
    const { mobileNo, userName } = req.body;

    if (!mobileNo) {
      return res
        .status(400)
        .json({ success: false, message: "Mobile number is required" });
    }

    // Generate OTP
    const otp = "1234";
    // const otp = generateOTP();
    const otpExpiry = new Date();
    otpExpiry.setMinutes(otpExpiry.getMinutes() + 10); // OTP valid for 10 minutes

    // Check if user exists
    let user = await User.findOne({ mobileNo });
    let isNewUser = false;

    if (!user) {
      // Create new user if not exists
      user = new User({
        mobileNo,
        otp: {
          code: otp,
          expiresAt: otpExpiry,
        },
        name: userName || "",
      });
      await user.save();
      isNewUser = true;
    } else {
      // Update existing user's OTP
      user.otp = {
        code: otp,
        expiresAt: otpExpiry,
      };
      await user.save();
    }

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully",
      // We're returning the OTP in the response for testing purposes
      // In production, remove this and actually send it via SMS
      otp,
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
