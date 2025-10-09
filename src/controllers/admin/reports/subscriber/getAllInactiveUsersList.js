const User = require("../../../../models/user");
const AppError = require("../../../../utils/AppError");
const catchAsync = require("../../../../utils/catchAsync");
const { successResponse } = require("../../../../utils/responseHandler");

exports.getAllInactiveUsersList = catchAsync(async(req, res, next) => {
    const id = req.user;
    
    const user = await User.find({status: "Inactive"}).populate('roleId', 'name').select('-password -__v');
    if(!user) return next(new AppError("user not found",404));

    successResponse(res, "user found successfully", user);

});
