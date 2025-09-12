const SubOrder = require("../../../models_old/SubOrder");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");

exports.getSingleOrderDetail = catchAsync(async (req, res, next) => {
    const { subOrderId } = req.params;

    if (!subOrderId) {
        return next(new AppError("vendorId and subOrderId are required", 400));
    }

    const subOrder = await SubOrder.findOne({ _id: subOrderId })
        .populate("products.productId")
        .populate("mainOrderId")
        .populate("assignDeliveryBoyId");

    if (!subOrder) {
        return next(new AppError(" subOrder not found ", 404));
    }

    successResponse(res, "Order details fetched successfully", subOrder);
});
