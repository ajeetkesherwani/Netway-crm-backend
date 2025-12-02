const MainOrder = require("../../../models_old/mainOrder");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");

exports.getOrderListDetail = catchAsync(async(req, res, next) => {

    const { mainOrderId } = req.params;
    if(!mainOrderId) return next(new AppError("mainOrderId is required",400));

    const listDetail = await MainOrder.find({ _id: mainOrderId}).lean();

    successResponse(res, "mainOrder listDeatils", listDetail);

});
