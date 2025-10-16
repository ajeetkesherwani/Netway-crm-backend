const UserWalletHistory = require("../../../models/userWalletHistory");
const User = require("../../../models/user");
const AppError = require("../../../utils/AppError");
const { successResponse } = require("../../../utils/responseHandler");
const catchAsync = require("../../../utils/catchAsync");

exports.getUserWalletHistoryList = catchAsync(async (req, res, next) => {

    const { userId } = req.params;
    if (!userId) return next(new AppError("userId is required", 400));


    const user = await User.findById(userId);
    if (!user) return next(new AppError("user not found", 404));


    const walletHistory = await UserWalletHistory.find({ userId })
        .sort({ createdAt: -1 }) // Most recent first
        .select("openingBalance transferAmount closingBalance transactionType remark createdAt");

    if (!walletHistory) return next(new AppError("wallet hostory not found for this User", 404));


    successResponse(res, "user wallet history found successfully", walletHistory);

});
