const SubOrder = require("../../../models/SubOrder");
const OrderReturn = require("../../../models/orderReturn");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");

exports.returnRequestOrder = catchAsync(async (req, res, next) => {

    const vendorId = req.vendor._id;

    const subOrder = await SubOrder.find({ vendorId, status: "return_requests" })
        .populate("mainOrderId", "orderNumber createdAt")
        .populate("products.productId", "productName")
        .sort({ createdAt: -1 });

    if (!subOrder || subOrder.length === 0) return next(new AppError("subOrder not found", 200));

    const response = await Promise.all(
        subOrder.map(async (sub) => {
            const returnInfo = await OrderReturn.findOne({
                orderId: sub.mainOrderId._id
            }).populate("userId", "name");

            return {
                subOrderId: sub._id,
                orderNumber: sub.mainOrderId?.orderNumber,
                orderDate: sub.mainOrderId?.createdAt,
                customerName: returnInfo?.userId?.name,
                returnReason: returnInfo?.returnReason,
                returnMessage: returnInfo?.returnMessage,
                returnImages: returnInfo?.uploadFiles,
                products: sub.products.map((p) => ({
                    name: p.productId?.productName || p.name,
                    variant: p.variant?.value,
                    quantity: p.quantity,
                    price: p.price,
                    discountPrice: p.discountedPrice,
                    gstPercentage: p.gstPercentage,
                    gstAmount: p.gstAmount,
                    totalItemAmount: p.totalItemAmount
                })),
                status: sub.status
            };
        }) 
    ); 

    successResponse(res, "Return requests order found successfully", response);
});