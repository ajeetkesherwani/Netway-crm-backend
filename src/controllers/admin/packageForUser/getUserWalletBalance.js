const User = require("../../../models/user");
const catchAsync = require("../../../utils/catchAsync"); 
const AppError = require("../../../utils/AppError");
const { successResponse } = require("../../../utils/responseHandler");

exports.getUserWalletBalance = catchAsync(async (req, res, next) => {

    const { userId } = req.params;

    // Find user
    const user = await User.findById(userId).select("walletBalance");

    if (!user) {
        return next(new AppError("User not found", 404));
    }

    return successResponse(res, "user wallet balance found successfully", user);

});
