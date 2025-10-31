const Lco = require("../../../models/lco");
const Reseller = require("../../../models/retailer");
const LcoWalletHistory = require("../../../models/lcoWalletHistory");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");

exports.reverseLcoWalletTransfer = catchAsync(async (req, res, next) => {
    const { lcoId, amount, transferDate, remark } = req.body;

    // ✅ Role validation — only Admin or Reseller allowed
    if (!["Admin", "Reseller"].includes(req.user.role)) {
        return next(new AppError("Only Admin or Reseller can reverse balance transfer", 403));
    }

    if (!lcoId) return next(new AppError("LcoId is required", 400));
    if (!amount) return next(new AppError("Amount is required", 400));
    if (!transferDate) return next(new AppError("TransferDate is required", 400));

    const lco = await Lco.findById(lcoId).populate({
        path: "retailerId",
        select: "_id resellerName walletBalance creditBalance"
    });
    if (!lco) return next(new AppError("Lco not found", 404));

    const reseller = lco.retailerId;
    if (!reseller) return next(new AppError("Reseller not found for this Lco", 404));

    // Check if LCO has enough balance to reverse
    if ((lco.walletBalance || 0) < amount) {
        return next(new AppError("Insufficient LCO wallet balance to reverse this transfer", 400));
    }

    // Deduct from LCO wallet
    const lcoOpening = lco.walletBalance || 0;
    lco.walletBalance -= amount;
    await lco.save();

    // Add back to reseller wallet
    const resellerOpening = reseller.walletBalance || 0;
    reseller.walletBalance += amount;
    await reseller.save();

    // Create reversal wallet history for LCO
    const walletHistory = await LcoWalletHistory.create({
        lco: lco._id,
        reseller: reseller._id,
        amount,
        transferDate,
        mode: "Reverse",
        remark: remark || "Reversal of previous transfer",
        createdBy: req.user.role,
        createdById: req.user._id,
        isReverse: true,
        openingBalance: lcoOpening,
        closingBalance: lco.walletBalance
    });

    successResponse(res, "Wallet reversal successful", {
        walletHistory,
        lcoWalletBalance: lco.walletBalance,
        reseller: {
            id: reseller._id,
            name: reseller.resellerName,
            walletBalance: reseller.walletBalance
        }
    });
});
