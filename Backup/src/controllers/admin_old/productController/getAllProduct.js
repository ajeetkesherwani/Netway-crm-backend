const Product = require("../../../models_old/products");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const paginate = require("../../../utils/paginate");

exports.getAllProduct = catchAsync(async (req, res) => {

  const { page, limit } = req.query;

  const allProduct = await paginate(Product, {}, {
    page,
    limit,
    sort: { createdAt: -1 },
    populate: { path: "serviceId", select: "name status image" },
    populate: { path: "categoryId", select: "name" },
    populate: { path: "subCategoryId", select: "name" },
    populate: { path: "vendor", select: "shopName shopId mobile profileImg" }
  });

  if (!allProduct || allProduct.paginateData.length === 0) {
    return res.status(404).json({
      success: false,
      message: "No products found for this vendor",
    });
  }

  res.status(200).json({
    success: true,
    message: "All products found for the vendor",
    count: allProduct.paginateData.length,
    data: allProduct,
  });
});
