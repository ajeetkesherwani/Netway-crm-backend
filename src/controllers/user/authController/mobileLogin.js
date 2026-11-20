const User = require("../../../models/user");
const createToken = require("../../../utils/createToken");

exports.mobileLogin = async (req, res) => {
  try {
    const { mobileNo } = req.body;

    if (!mobileNo) {
      return res.status(400).json({
        success: false,
        message: "Mobile number is required",
      });
    }

    const user = await User.findOne({
      "generalInformation.phone": mobileNo,
    }).select(
      "generalInformation.name generalInformation.phone generalInformation.email"
    );

    if (!user) {
      return res.status(400).json({ success: false, message: "User not found!" });
    }

    // Same response as verifyOtp: token + user info
    return createToken(user, 200, res);
  } catch (error) {
    console.error("Error in mobileLogin controller:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};