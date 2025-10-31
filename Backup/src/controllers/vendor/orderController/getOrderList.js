const MainOrder = require("../../../models/mainOrder");
const SubOrder = require("../../../models/SubOrder");
const User = require("../../../models/user");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");

exports.getOrderList = catchAsync(async (req, res) => {
  const vendorId = req.vendor._id;
  const allOrders = await SubOrder.find({ vendorId: vendorId })
    .populate("mainOrderId", "user_id")
    .populate("products.productId", "name primary_image")
    .sort({
      createdAt: -1,
    });

  if (!allOrders) {
    return new AppError("No Order found", 404);
  }

  const formattedOrders = await Promise.all(
    allOrders.map(async (order) => {
      const mainOrder = await MainOrder.findById(order.mainOrderId).lean();
      const user = await User.findById(mainOrder?.user_Id)
        .select("name")
        .lean();

      return {
        subOrderId: order._id,
        orderId: order.mainOrderId?._id || order.mainOrderId || null,
        userName: user?.name || null,
        customerId: mainOrder?.user_Id || null,
        totalAmount: order.totalAmount,
        vendorPayout: order.vendorPayout?.amount || 0,
        status: order.status,
        createdAt: order.createdAt,
        products: order.products.map((product) => ({
          name: product.name,
          quantity: product.quantity,
          variant: product.variant?.value,
          image: product.productId?.primary_image,
          price: product.discountedPrice || product.price,
          total: product.totalItemAmount,
        })),
      };
    })
  );

  res.status(200).json({
    success: true,
    message: "All Order found for the vendor",
    count: formattedOrders.length,
    data: formattedOrders,
  });
});
