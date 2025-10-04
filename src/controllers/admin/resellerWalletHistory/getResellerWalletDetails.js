const ResellerWalletHistory = require("../../../models/resellerWallerHistory");
const Reseller = require("../../../models/retailer");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");

exports.getResellerWalletHistoryDetails = catchAsync(async (req, res, next) => {
    const { resellerId, walletId } = req.params;

    if (!resellerId || !walletId)
        return next(new AppError("resellerId and walletId are required", 400));

    const lco = await Reseller.findById(resellerId);
    if (!lco) return next(new AppError("resellerId not found", 404));

    const history = await ResellerWalletHistory.findOne({
        _id: walletId,
        reseller: resellerId
    })
        .populate({
            path: "reseller",
            select: "_id resellerName phoneNo email houseNo pincode area subArea mobileNo fax messengerId dob balance panNumber code address state countyr taluka website walletBalance annversaryDate gstNo contactPersonName supportEmail contactPersonNumber whatsAppNumber resellerCode"
        });

    if (!history) return next(new AppError("Wallet history not found", 404));

    return successResponse(res, "Reseller wallet history detail fetched successfully", {
        resellerId,
        walletId,
        history
    });
});
