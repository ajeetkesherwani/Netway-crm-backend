const VariantType = require("../../../models/variantType");
const ProductVariant = require("../../../models/productVariant");
const catchAsync = require("../../../utils/catchAsync");
const {
  successResponse,
  errorResponse,
} = require("../../../utils/responseHandler");

exports.getFilterTypeValues = catchAsync(async (req, res, next) => {
  try {
    const { type } = req.params;

    const staticFilters = {
      Offer: ["10% Off", "20% Off", "Buy 1 Get 1"],
      "Cust. Rating": [
        "1 Star & Up",
        "2 Star & Up",
        "3 Star & Up",
        "4 Star & Up",
      ],
      "New Arrivals": ["Last 7 Days", "Last 30 Days"],
    };

    const filters = [];

    // If a specific type is requested
    if (type) {
      const formattedType = type.trim();

      // 1. Check in static filters
      if (staticFilters[formattedType]) {
        filters.push({
          name: formattedType,
          values: staticFilters[formattedType],
        });
        return successResponse(
          res,
          "Filter type retrieved successfully",
          filters
        );
      }

      console.log("Checking in DB for type:", formattedType);
      // 2. Check in DB-based filters
      const variantType = await VariantType.findOne({
        name: formattedType,
      }).lean();

      if (!variantType) {
        return errorResponse(res, "Invalid filter type", 404);
      }

      const values = await ProductVariant.find({
        variantTypeId: variantType._id,
      }).distinct("value");

      filters.push({
        name: variantType.name,
        values,
      });

      return successResponse(
        res,
        "Filter type retrieved successfully",
        filters
      );
    }

    // If no specific type is provided, return all filters (as original)
    const variantTypes = await VariantType.find({}).lean();

    for (const variantType of variantTypes) {
      const values = await ProductVariant.find({
        variantTypeId: variantType._id,
      }).distinct("value");

      if (values.length > 0) {
        filters.push({
          name: variantType.name,
          values,
        });
      }
    }

    // Add static filters
    for (const [name, values] of Object.entries(staticFilters)) {
      filters.push({ name, values });
    }

    successResponse(res, "Filter types retrieved successfully", filters);
  } catch (error) {
    console.error("Error in getFilterTypeValues controller:", error);
    errorResponse(res, "Internal server error", 500, error);
  }
});
