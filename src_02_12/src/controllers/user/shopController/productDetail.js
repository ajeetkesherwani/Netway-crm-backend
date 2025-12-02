const mongoose = require("mongoose");
const ProductInventory = require("../../../models/productInventry");
const Product = require("../../../models/products");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const {
  successResponse,
  errorResponse,
} = require("../../../utils/responseHandler");

exports.productDetail = catchAsync(async (req, res, next) => {
  const { productId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    return next(new AppError("Invalid product ID", 400));
  }

  const productDetail = await Product.findById(productId)
    .populate("serviceId", "name status image")
    .populate("categoryId", "name")
    .populate("subCategoryId", "name")
    .populate("vendor", "shopName shopId mobile profileImg")
    .populate("variants.VariantTypeId", "variantName");

  if (!productDetail) {
    successResponse(res, "Product not found", [], 200);
  }

  const inventory = await ProductInventory.findOne({
    product_id: productId,
  }).select("inventoryData");

  const productObj = productDetail.toObject();
  productObj.inventoryData = inventory ? inventory.inventoryData : [];

  const reletedProducts = await Product.find({
    _id: { $ne: productId },
    serviceId: productDetail.serviceId?._id,
    categoryId: productDetail.categoryId?._id,
  })
    .select("name primary_image price discountedPrice")
    .limit(6);

  const data = {
    ...productObj,
    reletedProducts: reletedProducts,
  };
  successResponse(res, "Product details found", data, 200);
});
