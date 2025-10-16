const mongoose = require("mongoose");
const User = require("../../../../models/user");
const AppError = require("../../../../utils/AppError");
const catchAsync = require("../../../../utils/catchAsync");
const { successResponse } = require("../../../../utils/responseHandler");

exports.updateUserStatus = catchAsync(async (req, res, next) => {
    const { userId, status } = req.body;
    console.log(req.body, "req.body")

    // 1️⃣ Validation
    if (!userId || !status) {
        return next(new AppError("userId and status are required", 400));
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
        return next(new AppError("Invalid userId", 400));
    }

    const allowedStatuses = ["active", "Inactive", "Suspend"];
    if (!allowedStatuses.includes(status)) {
        return next(new AppError(`Status must be one of: ${allowedStatuses.join(", ")}`, 400));
    }

    // 2️⃣ Find User
    const user = await User.findById(userId);
    if (!user) return next(new AppError("User not found", 404));
    console.log(user, "User");

    // 3️⃣ Permission Check

    if (req.user.role !== "Admin") {
        if (
            !user.generalInformation.createdBy ||
            user.generalInformation.createdBy.id.toString() !== req.user._id.toString()
        ) {
            return next(new AppError("You are not authorized to update this user", 403));
        }
    }

    // 4️⃣ Update status
    const oldStatus = user.status;
    user.status = status;
    await user.save();

    // 5️⃣ Return response
    successResponse(res, "User status updated successfully", {
        userId: user._id,
        oldStatus,
        newStatus: user.status
    });
});
