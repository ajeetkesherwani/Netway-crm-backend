const UserWalletHistory = require("../../../models/userWalletHistory");
const User = require("../../../models/user");
const AppError = require("../../../utils/AppError");
const { successResponse } = require("../../../utils/responseHandler");
const catchAsync = require("../../../utils/catchAsync");

exports.makePayment = catchAsync(async (req, res, next) => {

    const { userId, amount, refrenceNumber, paymentDate, paymentMode, remark} = req.body;
    if (!userId) return next(new AppError("userId is required", 400));


    const user = await User.findById(userId);
    if (!user) return next(new AppError("user not found", 404));
    
    const closeBalance = user.walletBalance + amount ;
    console.log("closeBalance",closeBalance);
    const walletHistory = UserWalletHistory.create({
        userId,
        transactionType:"credit",
        openingBalance:user.walletBalance,
        transferAmount:amount,
        closingBalance:closeBalance,
        paymentDate,
        purpose:"payment",
        paymentMode,
        referenceNumber:refrenceNumber,
        remark
    });

    user.walletBalance = closeBalance;
    user.save();

    successResponse(res, "user wallet updated successfully", walletHistory);

});
