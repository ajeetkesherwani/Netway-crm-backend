const Product = require("../../../models/products");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");

exports.deleteProduct = catchAsync(async (req, res) => {
  const vendorId = req.vendor._id;
  const productId = req.params.productId;

  const product = await Product.findOne({ _id: productId, vendor: vendorId });
  if (!product) {
    throw new AppError("Product not found or not authorized to delete", 404);
  }

  await product.deleteOne();

  return successResponse(res, "Product deleted successfully");
});
