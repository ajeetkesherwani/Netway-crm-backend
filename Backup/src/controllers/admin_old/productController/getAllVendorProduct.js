const Product = require("../../../models_old/products");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");

exports.getAllVendorProduct = catchAsync(async (req, res) => {
  const { vendorId } = req.params;

  const allVendorProduct = await Product.find({ vendor: vendorId })
    .populate("serviceId", "name status image")
    .populate("categoryId", "name")
    .populate("subCategoryId", "name")
    .populate("vendor", "shopName shopId mobile profileImg");

  if (!allVendorProduct) {
    return res.status(404).json({
      success: false,
      message: "No products found for this vendor",
    });
  }

  res.status(200).json({
    success: true,
    message: "All products found for the vendor",
    count: allVendorProduct.length,
    data: allVendorProduct,
  });
});
