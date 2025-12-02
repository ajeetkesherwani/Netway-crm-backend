const Product = require("../../../models/products");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");

exports.productDetail = catchAsync(async (req, res) => {
  const { productId } = req.params;
  console.log("productId:", productId);
  const productDetail = await Product.find({ _id: productId })
    .populate("serviceId", "name status image")
    .populate("categoryId", "name")
    .populate("subCategoryId", "name")
    .populate("vendor", "shopName shopId mobile profileImg");

  if (!productDetail) {
    return res.status(404).json({
      success: false,
      message: "No products found for this vendor",
    });
  }

  res.status(200).json({
    success: true,
    message: "Product details found",
    count: productDetail.length,
    data: productDetail,
  });
});
