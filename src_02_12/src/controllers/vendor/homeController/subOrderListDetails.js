const SubOrder = require("../../../models/SubOrder");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");

exports.getOrderListDetails = catchAsync(async (req, res, next) => {

  const subOrders = await SubOrder.find({ status: "pending" })
    .populate({
      path: "mainOrderId",
      populate: {
        path: "user_Id",
        model: "User",
        select: "name"
      }
    })
    .populate({
      path: "products.productId",
      model: "Products",
      select: "name price  primary_image"
    })
    .sort({ createdAt: -1 });

  if (!subOrders || subOrders.length === 0) return next(new AppError("subOrder not found", 404));

  const result = subOrders.map(subOrder => ({
    orderId: subOrder.mainOrderId?.orderNumber || "N/A",
    customerName: subOrder.mainOrderId?.user_Id?.name || "Unknown",
    totalOrder: subOrder.products.length,
    orderDate: subOrder.createdAt,
    productImage: subOrder.products[0]?.productId?.primary_image,
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
  })
);

  successResponse(res, "subOrders found ", result);

});