const Service = require("../../../models/service");
const Vendor = require("../../../models/vendor");
const Category = require("../../../models/category");
const catchAsync = require("../../../utils/catchAsync");
const {
  successResponse,
  errorResponse,
} = require("../../../utils/responseHandler");

exports.getAllCategory = catchAsync(async (req, res, next) => {
  try {
    const { vendorId } = req.params;
    console.log(vendorId);
    const vendor = await Vendor.findById(vendorId);
    if (!vendor) {
      errorResponse(res, "Vendor not found", 404);
    }

    const service = await Service.findById(vendor.serviceId);
    let filterData = [];
    switch (service.name) {
      case "Clothing":
        filterData = [
          "Size",
          "Color",
          "price Range",
          "Delivery Time",
          "Offer",
          "Cust. Rating",
          "New Arrivals",
        ];
        break;
      case "Footware":
        filterData = [
          "Size",
          "Color",
          "price Range",
          "Delivery Time",
          "Offer",
          "Cust. Rating",
          "New Arrivals",
        ];
        break;
      case "Accessories":
        filterData = [
          "Size",
          "Color",
          "price Range",
          "Delivery Time",
          "Offer",
          "Cust. Rating",
          "New Arrivals",
        ];
        break;
      default:
        return errorResponse(res, "Invalid service type", 400);
    }

    const categories = await Category.find({
      serviceId: vendor.serviceId,
      cat_id: { $exists: false },
    })
      .select("name")
      .lean();

    const updatedCategories = categories.map((cat) => ({
      ...cat,
      filterData,
    }));
    successResponse(
      res,
      "Categories retrieved successfully",
      updatedCategories
    );
  } catch (error) {
    console.error("Error in get services controller:", error);
    errorResponse(res, "Internal server error", 500, error);
  }
});
