const User = require("../../../models/user");
const catchAsync = require("../../../utils/catchAsync");

exports.getProfile = catchAsync(async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    return res.status(200).json({
      success: true,
      user: user,
    });
  } catch (error) {
    console.error("Error in getProfile controller:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
});
