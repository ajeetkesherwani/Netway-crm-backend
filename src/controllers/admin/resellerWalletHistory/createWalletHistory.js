// const ResellerWalletHistory = require("../../../models/resellerWallerHistory");
// const Reseller = require("../../../models/retailer");
// const AppError = require("../../../utils/AppError");
// const catchAsync = require("../../../utils/catchAsync");
// const { successResponse } = require("../../../utils/responseHandler");

// exports.createResellerWallet = catchAsync(async (req, res, next) => {

//     //Role validation — only admin allowed
//     if (req.user.role !== "Admin") {
//         return next(new AppError("Only admin can add wallet balance to reseller", 403));
//     }

//     const { resellerId, amount, paymentDate, mode, remark } = req.body;

//     if (!resellerId) return next(new AppError("resellerId is required", 400));
//     // if (!amount) return next(new AppError("amount is required", 400));
//     if (!amount || Number(amount) <= 0) {
//         return next(new AppError("Amount must be greater than 0", 400));
//     }
//     if (!paymentDate) return next(new AppError("paymentDate is required", 400));
//     if (!mode) return next(new AppError("mode is required", 400));

//     // Fetch reseller from DB
//     const reseller = await Reseller.findById(resellerId);
//     if (!reseller) {
//         return next(new AppError("Reseller not found", 404));
//     }

//     // Capture opening balance before update
//     const openingBalance = reseller.walletBalance || 0;

//     // Update reseller wallet
//     reseller.walletBalance = openingBalance + Number(amount);
//     if (mode === "Credit") {
//         reseller.creditBalance = (reseller.creditBalance || 0) + Number(amount);
//     }

//     //Capture closing balance after update
//     const closingBalance = reseller.walletBalance;

//     await reseller.save();


//     const walletHistory = await ResellerWalletHistory.create({
//         reseller: resellerId,
//         amount,
//         paymentDate,
//         mode,
//         remark,
//         createdBy: req.user.role,
//         createdById: req.user._id,
//         openingBalance,
//         closingBalance
//     });

//     successResponse(res, "Wallet created successfully", {
//         walletHistory,
//         walletBalance: reseller.walletBalance,
//         creditBalance: reseller.creditBalance
//     });

// });


const ResellerWalletHistory = require("../../../models/resellerWallerHistory");
const Reseller = require("../../../models/retailer");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");

exports.createResellerWallet = catchAsync(async (req, res, next) => {

    // Role validation — only admin allowed
    if (req.user.role !== "Admin") {
        return next(new AppError("Only admin can add wallet balance to reseller", 403));
    }

    const { resellerId, amount, paymentDate, mode, remark } = req.body;

    if (!resellerId) return next(new AppError("resellerId is required", 400));
    if (!amount || Number(amount) <= 0) {
        return next(new AppError("Amount must be greater than 0", 400));
    }
    if (!paymentDate) return next(new AppError("paymentDate is required", 400));
    if (!mode) return next(new AppError("mode is required", 400));

    // Fetch reseller (ONLY to read balances)
    const reseller = await Reseller.findById(resellerId).select("walletBalance creditBalance");
    if (!reseller) {
        return next(new AppError("Reseller not found", 404));
    }

    // Capture opening balance
    const openingBalance = reseller.walletBalance || 0;

    // Prepare wallet update
    const updateQuery = {
        $inc: {
            walletBalance: Number(amount)
        }
    };

    if (mode === "Credit") {
        updateQuery.$inc.creditBalance = Number(amount);
    }

    // Atomic update (no .save() → no document validation issue)
    const updatedReseller = await Reseller.findByIdAndUpdate(
        resellerId,
        updateQuery,
        { new: true }
    );

    // Capture closing balance
    const closingBalance = updatedReseller.walletBalance;

    // Create wallet history
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

    successResponse(res, "Wallet created successfully", {
        walletHistory,
        walletBalance: updatedReseller.walletBalance,
        creditBalance: updatedReseller.creditBalance
    });
});
