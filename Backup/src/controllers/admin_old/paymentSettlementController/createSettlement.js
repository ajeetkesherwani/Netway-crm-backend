const mongoose = require("mongoose");
const VendorWalletHistory = require("../../../models_old/vendorWalletHistory");
const { successResponse } = require("../../../utils/responseHandler");
const catchAsync = require("../../../utils/catchAsync");
const AppError = require("../../../utils/AppError");

exports.settleVendorWallets = catchAsync(async (req, res) => {
    const { walletIds } = req.body;

    if (!Array.isArray(walletIds) || walletIds.length === 0) {
        return res.status(400).json({ success: false, message: "walletIds is required" });
    }

    const objectIds = walletIds.map(id => new mongoose.Types.ObjectId(id));


    const wallets = await VendorWalletHistory.find({
        _id: { $in: objectIds },
        status: "pending"
    })
        .select("orderId amount status")
        .lean();

    if (!wallets.length) {
        return next(new AppError("no matching pending wallets found for settlement", 404))
    }

    await VendorWalletHistory.updateMany(
        { _id: { $in: objectIds }, status: "pending" },
        { $set: { status: "settled" } }
    );

    const totalAmount = wallets.reduce((sum, w) => sum + (w.amount || 0), 0);

    const responseData = {
        totalAmount,
        settledEntries: wallets.map(w => ({
            orderId: w.orderId,
            amount: w.amount,
            status: "settled"
        }))
    };

    return successResponse(res, "Wallets settled successfully", responseData);
});
