const LcoWalletHistory = require("../../../models/lcoWalletHistory");
const Lco = require("../../../models/lco");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");

exports.getLcoWalletHistoryDetails = catchAsync(async (req, res, next) => {
    const { lcoId, walletId } = req.params;

    if (!lcoId || !walletId)
        return next(new AppError("LcoId and walletId are required", 400));

    const lco = await Lco.findById(lcoId);
    if (!lco) return next(new AppError("Lco not found", 404));

    const history = await LcoWalletHistory.findOne({
        _id: walletId,
        lco: lcoId
    })
        .populate({
            path: "reseller",
            select: "_id resellerName phoneNo email houseNo pincode area subArea mobileNo fax messengerId dob balance panNumber code address state countyr taluka website walletBalance annversaryDate gstNo contactPersonName supportEmail contactPersonNumber whatsAppNumber resellerCode"
        });

    if (!history) return next(new AppError("Wallet history not found", 404));

    return successResponse(res, "LCO wallet history detail fetched successfully", {
        lcoId,
        walletId,
        history
    });
});
