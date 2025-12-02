const Vendor = require("../../../models/vendor");
const Product = require("../../../models/products");
const Category = require("../../../models/category");
const catchAsync = require("../../../utils/catchAsync");

exports.vendorShopList = catchAsync(async (req, res, next) => {
  try {
    const { vendorId } = req.params;
    const {
      categoryId,
      subCategoryId,
      fabricId,
      minPrice,
      maxPrice,
      variantTypeId,
      variantValues, // comma-separated values like "Red,XL"
    } = req.query;
    console.log(categoryId);
    const vendor = await Vendor.findById(vendorId).select(
      "shopName profileImg rating shopOpeningTime shopClosingTime serviceId"
    );

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: "Vendor not found",
      });
    }

    // ✅ Get categories of vendor's service
    const category = await Category.find({
      serviceId: vendor.serviceId,
      cat_id: null,
    }).select("name serviceId cat_id");

    // ✅ Build filtered product query
    const productQuery = { vendor: vendorId };

    if (categoryId) productQuery.categoryId = categoryId;
    if (subCategoryId) productQuery.subCategoryId = subCategoryId;
    if (fabricId) productQuery.fabricId = fabricId;

    if (minPrice || maxPrice) {
      productQuery.discountedPrice = {};
      if (minPrice) productQuery.discountedPrice.$gte = Number(minPrice);
      if (maxPrice) productQuery.discountedPrice.$lte = Number(maxPrice);
    }

    if (variantTypeId && variantValues) {
      const valuesArray = variantValues.split(",");
      productQuery.variants = {
        $elemMatch: {
          VariantTypeId: variantTypeId,
          value: { $in: valuesArray },
        },
      };
    }

    // ✅ Fetch filtered products
    const products = await Product.find(productQuery).select(
      "name price primary_image discountedPrice shortDiscription categoryId serviceId variants"
    );

    return res.status(200).json({
      success: true,
      message: "Vendor shop data retrieved successfully",
      shopDetail: vendor,
      category: category,
      products: products,
    });
  } catch (error) {
    console.error("Error in vendorShopList controller:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
});
