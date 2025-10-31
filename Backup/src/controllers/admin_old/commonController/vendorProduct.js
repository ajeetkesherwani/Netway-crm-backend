const VendorProduct = require("../../../models_old/products");
const AppError = require("../../../utils/AppError");

exports.vendorProduct = async (req, res, next) => {
  const { vendor } = req.params;
  const { categoryId, subCategoryId } = req.query;

  try {
    if (!vendor) {
      return next(new AppError("Vendor ID is required", 400));
    }

    const query = { vendor };

    if (categoryId) query.categoryId = categoryId;
    if (subCategoryId) query.subCategoryId = subCategoryId;
    console.log("Query:", query);
    const products = await VendorProduct.find(query).select("name");
    console.log("Vendor Products:", products);
    res.status(200).json({
      success: true,
      message: "Vendor products fetched successfully",
      data: products,
    });
  } catch (error) {
    console.error("getVendorProducts Error:", error);
    next(new AppError("Failed to fetch vendor products", 500));
  }
};
