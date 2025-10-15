const Lco = require("../../../models/lco");
const Reseller = require("../../../models/retailer");
const LcoWalletHistory = require("../../../models/lcoWalletHistory");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");

exports.transferToLco = catchAsync(async (req, res, next) => {
    const { lcoId, amount, transferDate, remark } = req.body;

    // Role validation — only Admin and Reseller can transfer to LCO
    if (!["Admin", "Reseller"].includes(req.user.role)) {
        return next(new AppError("Only Admin or Reseller can transfer balance to LCO", 403));
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

    // Capture LCO opening balance before transfer
    const openingBalance = lco.walletBalance || 0;

    // Check reseller wallet balance (unless admin)
    if (req.user.role !== "Admin" && reseller.walletBalance < amount) {
        return next(new AppError("Insufficient balance in reseller wallet", 400));
    }

    // Deduct from reseller wallet if not admin
    if (req.user.role !== "Admin") {
        reseller.walletBalance = (reseller.walletBalance || 0) - amount;
        await reseller.save();
    }

    // Add to LCO wallet
    lco.walletBalance = (lco.walletBalance || 0) + amount;
    await lco.save();

    // Capture LCO closing balance after transfer
    const closingBalance = lco.walletBalance;

    // Create LCO wallet history
    const walletHistory = await LcoWalletHistory.create({
        lco: lco._id,
        reseller: reseller._id,
        amount,
        transferDate,
        mode: "Cash",
        remark: remark || "",
        createdBy: req.user.role,
        createdById: req.user._id,
        openingBalance,
        closingBalance
    });

    successResponse(res, "Wallet created successfully", {
        walletHistory,
        lcoWalletBalance: lco.walletBalance,
        reseller: {
            id: reseller._id,
            name: reseller.resellerName,
            walletBalance: reseller.walletBalance,
        }
    });
});
