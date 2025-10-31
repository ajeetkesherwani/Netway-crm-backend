const SubOrder = require("../../../models/SubOrder");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");

exports.getOrderDetailsForVendor = catchAsync(async(req, res, next) => {

    const { orderId } = req.params;
    if(!orderId) return next(new AppError("id is required",400));

    const orderDetail = await SubOrder.find({ _id: orderId });
    if(!orderDetail) return next(new AppError("Order not found",404));

    successResponse(res, "subOrder details", orderDetail);

});