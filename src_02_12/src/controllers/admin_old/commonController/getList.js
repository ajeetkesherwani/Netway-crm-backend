const Services = require("../../../models_old/service");
const Category = require("../../../models_old/category");
const Vendor = require("../../../models_old/vendor");
const VariantType = require("../../../models_old/variantType");
const ProductVariant = require("../../../models_old/productVariant");
const AppError = require("../../../utils/AppError");

exports.getList = async (req, res, next) => {
  const { type } = req.params;
  const { serviceId } = req.query;
  console.log("getList called with type:", type, "and serviceId:", serviceId);
  const typeMap = {
    service: { model: Services, select: "name", applyFilter: false },
    category: { model: Category, select: "name", applyFilter: true },
    vendor: { model: Vendor, select: "shopName", applyFilter: true },
    variantType: {
      model: VariantType,
      select: "variantName",
      applyFilter: true,
    },
    productVariant: {
      model: ProductVariant,
      select: "variants",
      applyFilter: true,
    },
  };

  try {
    if (!typeMap[type]) {
      return next(new AppError("Invalid type provided", 400));
    }

    const { model, select, applyFilter } = typeMap[type];

    let query = {};

    if (applyFilter) {
      query.serviceId = serviceId;
      if (type === "category") {
        query.cat_id = null;
      }
    }

    const list = await model.find(query).select(select);

    res.status(200).json({
      success: true,
      message: "Data fetched successfully",
      data: list,
    });
  } catch (error) {
    console.error("getList Error:", error);
    next(new AppError("Failed to fetch data", 500));
  }
};
