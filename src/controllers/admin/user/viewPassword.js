const User = require("../../../models/user");
const catchAsync = require("../../../utils/catchAsync");
const AppError = require("../../../utils/AppError");
const { successResponse } = require("../../../utils/responseHandler");
 
// Get plain password by user ID (Admin Only)
exports.getUserPassword = catchAsync(async (req, res, next) => {
 
    const { userId } = req.params;
 
 
    if (req.user.role !== "Admin") {
        return next(new AppError("You are not authorized to view passwords", 403));
    }
 
    // Validate userId
    if (!userId) {
        return next(new AppError("userId is required", 400));
    }
 
    // Fetch user and select only plainPassword field
    const user = await User.findById(userId);
 
    if (!user) {
        return next(new AppError("User not found", 404));
    }
 
    successResponse(res, "User password fetched successfully", {
        username: user.generalInformation.username,
        plainPassword: user.generalInformation.plainPassword,
    });
});