const ResellerWalletHistory = require("../../../models/resellerWallerHistory");
const Reseller = require("../../../models/retailer");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");

exports.createResellerReverseBalance = catchAsync(async (req, res, next) => {

    // Role validation — only admin allowed
    if (req.user.role !== "Admin") {
        return next(new AppError("Only admin can add wallet balance to reseller", 403));
    }

    const { resellerId, amount, paymentDate, mode, remark } = req.body;

    if (!resellerId) next(new AppError("resellerId is required", 400));
    if (!amount) next(new AppError("amount is required", 400));
    if (!paymentDate) next(new AppError("paymentDate is required", 400));
    if (!mode) next(new AppError("mode is required", 400));


    if (mode !== "Reverse") {
        return next(new AppError("Mode must be 'Reverse' for reversing balance", 400));
    }

    const reseller = await Reseller.findById(resellerId);
    if (!reseller) {
        return next(new AppError("Reseller not found", 404));
    }


    // Opening balance before deduction
    const openingBalance = reseller.walletBalance || 0;

    // Deduct from reseller wallet
    reseller.walletBalance = openingBalance - Number(amount);

    // Closing balance after deduction
    const closingBalance = reseller.walletBalance;


    const walletHistory = await ResellerWalletHistory.create({
        reseller: resellerId,
        amount,
        paymentDate,
        mode,
        remark,
        createdBy: req.user.role,
        createdById: req.user._id,
        openingBalance,
        closingBalance
    });


    await reseller.save();

    successResponse(res, "Wallet updated successfully", {
        walletHistory,
        walletBalance: reseller.walletBalance,
    });
});

