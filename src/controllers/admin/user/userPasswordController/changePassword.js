const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const User = require("../../../../models/user");
const AppError = require("../../../../utils/AppError");
const catchAsync = require("../../../../utils/catchAsync");
const { successResponse } = require("../../../../utils/responseHandler");

exports.changePassword = catchAsync(async (req, res, next) => {

    const { password, newPassword } = req.body;

    const loggedUser = req.user; // This comes from auth middleware

    if (!password || !newPassword) {
        return next(new AppError("Old password and new password are required.", 400));
    }

    // Fetch the logged-in user
    const user = await User.findById(loggedUser._id).select("+generalInformation.password");

    if (!user) return next(new AppError("User not found.", 404));

    // Verify old password
    const isMatch = await bcrypt.compare(password, user.generalInformation.password);
    if (!isMatch) return next(new AppError("Old password is incorrect.", 401));

    // Check ownership
    if (
        user.generalInformation.createdBy.id.toString() !== loggedUser._id.toString() &&
        user.generalInformation.createdBy.type !== loggedUser.roleName
    ) {
        return next(new AppError("You are not authorized to change this password.", 403));
    }

    // Hash new password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    user.generalInformation.password = hashedPassword;
    await user.save();

    successResponse(res, "Password changed successfully.");
});
