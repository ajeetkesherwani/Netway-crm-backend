const User = require("../../../models/user");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");

exports.getUserList = catchAsync(async(req, res, next) => {

    const user = await User.find();
    if(!user) return next(new AppError("user not found",404));

    successResponse(res, "user found successfully", user);

});