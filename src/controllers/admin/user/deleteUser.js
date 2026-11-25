const User = require("../../../models/user");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");
const { createLog } = require("../../../utils/userLogActivity");

exports.deleteUser = catchAsync(async (req, res, next) => {

    const { userId } = req.params;
    if (!userId) return next(new AppError("userId is required", 400));

    const user = await User.findById(userId);
    if (!user) return next(new AppError("user not found", 404));

    const deletedUser = await User.findByIdAndDelete(userId);
    if (!deletedUser) return next(new AppError("user not found", 404));
    await createLog({
        userId: user._id,
        type: "User Deleted",
        description: `User deleted: ${user.generalInformation?.name || user.generalInformation?.username || userId}`,
        details: {
            customerName: user.generalInformation?.name,
            username: user.generalInformation?.username,
            userId: user.generalInformation?.UserId,
        },
        addedBy: {
            id: req.user._id,
            role: req.user.role || "Admin",
        },
        ip: req.ip || req.headers["x-forwarded-for"],
    });

    successResponse(res, "userDeleted successfully", user);

});