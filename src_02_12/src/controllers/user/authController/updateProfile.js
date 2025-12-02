const User = require("../../../models/user");
const deleteOldFiles = require("../../../utils/deleteOldFiles");

const updateProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const updateData = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    if (
      req.files &&
      req.files.profileImage &&
      req.files.profileImage.length > 0
    ) {
      user.profileImage = `${req.files.profileImage[0].destination}/${req.files.profileImage[0].filename}`;
    }

    const allowedUpdates = ["name", "email", "dob", "gender"];
    allowedUpdates.forEach((field) => {
      if (updateData[field] !== undefined) {
        user[field] = updateData[field];
      }
    });

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user,
    });
  } catch (error) {
    console.error("Error in updateProfile controller:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

module.exports = updateProfile;
