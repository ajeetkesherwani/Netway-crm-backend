const { randomInt } = require("crypto");
const User = require("../../../models/user");
const { sendTemplateSMS } = require("../../../utils/smsService");

// Generate a 4-digit OTP
const generateOTP = () => {
  return randomInt(1000, 10000).toString();
};

// Send OTP to mobile number
const sendOtp = async (req, res) => {
  try {
    const { mobileNo } = req.body;
    console.log("Received mobile number:", mobileNo);

    if (!mobileNo) {
      return res.status(400).json({ success: false, message: "Mobile number is required" });
    }

    let user = await User.findOne({ "generalInformation.phone": mobileNo });
    if (!user) {
      return res.status(400).json({ success: false, message: "User not found!" });
    }

    const otp = generateOTP();
    const otpExpiry = new Date();
    otpExpiry.setMinutes(otpExpiry.getMinutes() + 10); // OTP valid for 10 minutes

    // Update OTP in existing user
    user.generalInformation.otp = {
      code: otp,
      expiresAt: otpExpiry,
    };

    await user.save();

    const smsResponse = await sendTemplateSMS(mobileNo, "Your OTP code", { otp });
    if (smsResponse === undefined || smsResponse === null) {
      throw new Error("SMS provider did not return a response");
    }

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully",
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
