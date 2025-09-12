const OrderReturn = require("../../../models/orderReturn");
const SubOrder = require("../../../models/SubOrder");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");

exports.getOrderReturn = catchAsync(async (req, res, next) => {

    const orderReturnId = req.params.id;
    if (!orderReturnId) return next(new AppError("orderReturnId is required", 400));
 
    const returnOrder = await OrderReturn.findById(orderReturnId)
        .populate("userId", "name")
        .populate("orderId", "orderNumber createdAt")

    if (!returnOrder) return next(new AppError("return Order not found", 404));

    const subOrders = await SubOrder.find({ mainOrderId: returnOrder.orderId._id })
        .populate("products.productId", "productName");

    const returnedItems = subOrders.flatMap(sub =>
        sub.products.map(p => ({
            name: p.name || "Product",
            variant: p.variant?.value || "value", 
            price: p.price || 0,
            quantity: p.quantity || 0,
        }))
    );

    const orderStatus = returnOrder.orderStatus;
    const refundStatus =
        ["requestSubmitted", "pickUp"].includes(orderStatus)
            ? "Processing (3-5 business days)"
            : orderStatus === "inReview"? "In Review"
            : orderStatus === "completed"? "Refunded"
            : orderStatus === "rejected"? "Rejected": "Pending";

    const response = {
        productImages: returnOrder.uploadFiles,
        customerName: returnOrder.userId?.name,
        orderDate: returnOrder.orderId?.createdAt,
        orderNumber: returnOrder.orderId?.orderNumber || returnOrder.orderId?._id.toString(),
        returnReceivedOn: returnOrder.createdAt,
        returnReason: returnOrder.returnReason,
        returnMessage: returnOrder.returnMessage,
        itemsReturned: returnedItems,
        refundStatus
    };


    successResponse(res, "return Order Details", response);

});