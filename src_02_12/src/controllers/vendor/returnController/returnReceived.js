const SubOrder = require("../../../models/SubOrder");
const OrderReturn = require("../../../models/orderReturn");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");


exports.returnReceivedOrder = catchAsync(async (req, res, next) => {
  const { subOrderId } = req.params;

    const vendorId = req.vendor._id; 

  if (!subOrderId) return next(new AppError("subOrderId is required", 400));

  const subOrder = await SubOrder.findOne({ vendorId, _id:subOrderId })
    .populate("mainOrderId", "orderNumber createdAt")
    .populate("products.productId", "productName");

  if (!subOrder) return next(new AppError("suborder not found", 200));

  if (subOrder.status !== "return_requests") {
    return next(new AppError("SubOrder is not in return request status", 400));
  }

  subOrder.status = "return_received";
  await subOrder.save();

  const returnOrder = await OrderReturn.findOne({
    orderId: subOrder.mainOrderId._id
  }).populate("userId", "name");

  if (returnOrder) {
    returnOrder.orderStatus = "completed";
    await returnOrder.save();
  }

  const response = {
    subOrderId: subOrder._id,
    orderNumber: subOrder.mainOrderId?.orderNumber,
    orderDate: subOrder.mainOrderId?.createdAt,
    customerName: returnOrder?.userId?.name || "N/A",
    returnReason: returnOrder?.returnReason || "N/A",
    returnMessage: returnOrder?.returnMessage || "N/A",
    returnImages: returnOrder?.uploadFiles || [],
    products: subOrder.products.map((p) => ({
      name: p.productId?.productName || p.name,
      variant: p.variant?.value,
      quantity: p.quantity,
      price: p.price,
      discountedPrice: p.discountedPrice,
      gstPercentage: p.gstPercentage,
      gstAmount: p.gstAmount,
      totalItemAmount: p.totalItemAmount
    })),
    subOrderStatus: subOrder.status,
    orderReturnStatus: returnOrder?.orderStatus || "N/A"
  };

  successResponse(res, "Return marked as received successfully", response);


});
