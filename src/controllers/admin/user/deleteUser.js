const User = require("../../../models/user");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");

exports.deleteUser = catchAsync(async (req, res, next) => {

    const userId = req.params;
    if (!userId) return next(new AppError("userId is required", 400));

    const user = await User.findByIdAndDelete(userId);
    if (!user) return next(new AppError("user not found", 404));

    successResponse(res, "userDeleted successfully", user);

});