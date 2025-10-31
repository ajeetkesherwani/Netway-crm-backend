const LcoWalletHistory = require("../../../models/lcoWalletHistory");
const Lco = require("../../../models/lco");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");

exports.getLcoWalletHistory = catchAsync(async (req, res, next) => {
    const { lcoId } = req.params;

    if (!lcoId) return next(new AppError("LcoId is required", 400));

    // Fetch LCO with reseller info
    const lco = await Lco.findById(lcoId).populate({
        path: "retailerId",
        select: "_id resellerName walletBalance"
    });
    if (!lco) return next(new AppError("Lco not found", 404));

    const histories = await LcoWalletHistory.find({ lco: lcoId })
        .populate({
            path: "reseller",
            select: "_id resellerName walletBalance",
        })
        .sort({ createdAt: -1 });

    // Format each history item without reseller info
    const formattedHistories = histories.map(history => ({
        _id: history._id,
        amount: history.amount,
        transferDate: history.transferDate,
        mode: history.mode,
        remark: history.remark,
        createdBy: history.createdBy,
        createdById: history.createdById,
        createdAt: history.createdAt,
        updatedAt: history.updatedAt
    }));

    return successResponse(res, "LCO wallet history fetched successfully", {
        lcoId,
        lcoWalletBalance: lco.walletBalance || 0,
        reseller: {
            id: lco.retailerId?._id || null,
            name: lco.retailerId?.resellerName || null,
            walletBalance: lco.retailerId?.walletBalance || 0
        },
        histories: formattedHistories
    });
});

