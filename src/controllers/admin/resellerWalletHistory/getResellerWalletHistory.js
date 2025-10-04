// const ResellerWalletHistory = require("../../../models/resellerWallerHistory");
// const Reseller = require("../../../models/retailer");
// const AppError = require("../../../utils/AppError");
// const catchAsync = require("../../../utils/catchAsync");
// const { successResponse } = require("../../../utils/responseHandler");

// exports.getResellerWalletHistory = catchAsync(async (req, res, next) => {
//     const { resellerId } = req.params;

//     if (!resellerId) return next(new AppError("LcoId is required", 400));

//     // Check if LCO exists
//     const reseller = await Reseller.findById(resellerId);
//     if (!reseller) return next(new AppError("Lco not found", 404));

//     const histories = await ResellerWalletHistory.find({ reseller: resellerId });


//     return successResponse(res, "Rseller wallet history fetched successfully", {
//         resellerId,
//         histories
//     });
// });

const ResellerWalletHistory = require("../../../models/resellerWallerHistory");
const Reseller = require("../../../models/retailer");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");

exports.getResellerWalletHistory = catchAsync(async (req, res, next) => {
    const { resellerId } = req.params;

    if (!resellerId) return next(new AppError("ResellerId is required", 400));

    // Check if Reseller exists
    const reseller = await Reseller.findById(resellerId).select(
        "_id resellerName walletBalance creditBalance"
    );
    if (!reseller) return next(new AppError("Reseller not found", 404));

    // Get wallet histories for reseller
    const histories = await ResellerWalletHistory.find({ reseller: resellerId })
        .sort({ createdAt: -1 });

    // Format histories without repeating reseller info
    const formattedHistories = histories.map(history => ({
        _id: history._id,
        amount: history.amount,
        paymentDate: history.paymentDate,
        mode: history.mode,
        remark: history.remark,
        createdBy: history.createdBy,
        createdById: history.createdById,
        createdAt: history.createdAt,
        updatedAt: history.updatedAt
    }));

    return successResponse(res, "Reseller wallet history fetched successfully", {
        resellerId: reseller._id,
        resellerName: reseller.resellerName,
        walletBalance: reseller.walletBalance,
        creditBalance: reseller.creditBalance,
        histories: formattedHistories
    });
});
