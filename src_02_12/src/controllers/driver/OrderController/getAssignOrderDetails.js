const SubOrder = require("../../../models/SubOrder");
const Products = require("../../../models/products");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");

exports.getAssignOrderDetails = catchAsync(async (req, res, next) => {
  const driverId = req.driver._id;
  const { subOrderId } = req.params;

  if (!driverId) return next(new AppError("Driver not authenticated", 401));
  if (!subOrderId) return next(new AppError("SubOrder ID is required", 400));

  const subOrder = await SubOrder.findOne({
    _id: subOrderId,
    assignDeliveryBoyId: driverId,
    isDeliveryAsign: true,
  })
    .populate({
      path: "mainOrderId",
      select: "orderNumber"
    })
    .lean();
   

  if (!subOrder) {
    return next(new AppError("SubOrder not found or not assigned to you", 404));
  }

  const productIds = subOrder.products.map(p => p.productId);
  const productDetails = await Products.find({ _id: { $in: productIds } })
    .select("name primary_image")
    .lean();

  const items = subOrder.products.map(item => {
    const productInfo = productDetails.find(p => p._id.toString() === item.productId.toString());

    return {
      productId: item.productId,
      productName: productInfo?.name || "Unknown Product",
      productImage: productInfo?.primary_image || null,
      quantity: item.quantity,
      price: item.price,
      orderNumber: subOrder.mainOrderId?.orderNumber || "N/A",
    };
  });

  successResponse(res, "SubOrder items fetched", items);
});
