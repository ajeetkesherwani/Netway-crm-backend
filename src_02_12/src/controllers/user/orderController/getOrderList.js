const MainOrder = require("../../../models/mainOrder");
const SubOrder = require("../../../models/SubOrder");
const OrderAddress = require("../../../models/OrderAddress");
const catchAsync = require("../../../utils/catchAsync");
const AppError = require("../../../utils/AppError");

exports.getOrderList = catchAsync(async (req, res, next) => {
  const userId = req.user.id;

  const orders = await MainOrder.find({ user_Id: userId })
    .select("_id orderNumber paymentMethod totalAmount createdAt")
    .sort({ createdAt: -1 });

  if (!orders || orders.length === 0) {
    return res.status(200).json({
      success: true,
      message: "No orders found for this user",
      data: [],
    });
  }

  const orderList = await Promise.all(
    orders.map(async (order) => {
      const subOrders = await SubOrder.find({ mainOrderId: order._id })
        .select("vendorId products totalAmount status")
        .populate({
          path: "products.productId",
          select: "name primary_image",
        })
        .populate({
          path: "vendorId",
          select: "shopName profileImg",
        });

      return {
        _id: order._id,
        orderId: order._id,
        orderNumber: order.orderNumber,
        paymentMethod: order.paymentMethod,
        totalAmount: order.totalAmount,
        createdAt: order.createdAt,
        subOrders: subOrders.map((sub) => ({
          subOrderId: sub._id,
          totalAmount: sub.totalAmount,
          status: sub.status,
          shopName: sub.vendorId.shopName,
          products: sub.products.map((p) => ({
            name: p.productId?.name,
            image: p.productId?.primary_image,
            quantity: p.quantity,
            variant: p.variant,
          })),
        })),
      };
    })
  );

  res.status(200).json({
    success: true,
    count: orderList.length,
    data: orderList,
  });
});
