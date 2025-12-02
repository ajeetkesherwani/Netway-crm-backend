const Category = require("../../../models/category");
const VarientType = require("../../../models/variantType");
const ProductVariant = require("../../../models/productVariant");
const catchAsync = require("../../../utils/catchAsync");
const {
  successResponse,
  errorResponse,
} = require("../../../utils/responseHandler");

exports.getList = catchAsync(async (req, res) => {
  try {
    const { vendor } = req;
    const { type } = req.params;
    const { categoryId, variantType } = req.query;

    if (!vendor) {
      return errorResponse(res, "Vendor not found", 404);
    }

    let data = [];
    let message = "";

    const fetchCategoryData = async () => {
      const query = { cat_id: { $exists: false }, serviceId: vendor.serviceId }; // Added serviceId condition
      if (type === "category") {
        return Category.find(query).select("name");
      }
      if (type === "subcategory") {
        if (!categoryId)
          return errorResponse(res, "categoryId is required", 400);
        return Category.find({ ...query, cat_id: categoryId }).select("name"); // Include categoryId filter
      }
    };

    switch (type) {
      case "category":
      case "subcategory":
        data = await fetchCategoryData();
        message =
          type === "category"
            ? "Category list fetched successfully"
            : "Subcategory list fetched successfully";
        break;

      case "varientType":
        data = (
          await VarientType.find({ serviceId: vendor.serviceId }).select(
            "variantName"
          )
        ).map((item) => ({ _id: item._id, name: item.variantName }));
        message = "Varient Type data fetched successfully";
        break;

      case "productVarient":
        if (!variantType)
          return errorResponse(
            res,
            "variantType is required to fetch product variants",
            400
          );
        data = (
          await ProductVariant.find({ variantTypeId: variantType }).select(
            "variants _id"
          )
        ).map((item) => ({ _id: item._id, variants: item.variants }));
        message = "Product Variant data fetched successfully";
        break;

      default:
        return errorResponse(res, "Invalid type provided", 400);
    }

    successResponse(res, message, data, 200);
  } catch (error) {
    console.error("Error in getList controller:", error);
    return errorResponse(res, "Internal server error", 500, error.message);
  }
});
