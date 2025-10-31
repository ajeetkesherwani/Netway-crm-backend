const MainOrder = require("../../../models/mainOrder");
const SubOrder = require("../../../models/SubOrder");
const OrderAddress = require("../../../models/OrderAddress");
const catchAsync = require("../../../utils/catchAsync");
const AppError = require("../../../utils/AppError");

exports.getOrderDetails = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const mainOrder = await MainOrder.findById(id).select("-__v").populate({
    path: "address",
    model: OrderAddress,
    select: "-__v",
  });

  if (!mainOrder) {
    return next(new AppError("Order not found", 404));
  }

  const subOrders = await SubOrder.find({ mainOrderId: mainOrder._id })
    .select("-__v")
    .populate({
      path: "products.productId",
      select: "_id name primary_image",
    })
    .populate({
      path: "vendorId",
      select: "shopName profileImg",
    });

  const formattedSubOrders = subOrders.map((sub) => ({
    subOrderId: sub._id,
    vendor: {
      _id: sub.vendorId?._id,
      shopName: sub.vendorId?.shopName,
      profileImg: sub.vendorId?.profileImg,
    },
    totalAmount: sub.totalAmount,
    status: sub.status,
    products: sub.products.map((p) => ({
      name: p.productId?.name,
      image: p.productId?.primary_image,
      quantity: p.quantity,
      variant: p.variant,
    })),
  }));

  res.status(200).json({
    success: true,
    data: {
      orderId: mainOrder._id,
      orderNumber: mainOrder.orderNumber,
      totalAmount: mainOrder.totalAmount,
      totalGST: mainOrder.totalGST,
      totalDiscount: mainOrder.totalDiscount,
      paymentMethod: mainOrder.paymentMethod,
      paymentStatus: mainOrder.paymentStatus,
      couponSummary: mainOrder.couponSummary,
      createdAt: mainOrder.createdAt,
      address: mainOrder.address,
      subOrders: formattedSubOrders,
    },
  });
});
