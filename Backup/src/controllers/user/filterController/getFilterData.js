const Service = require("../../../models/service");
const Vendor = require("../../../models/vendor");
const catchAsync = require("../../../utils/catchAsync");
const {
  successResponse,
  errorResponse,
} = require("../../../utils/responseHandler");

exports.getFilterData = catchAsync(async (req, res, next) => {
  try {
    const { vendorId } = req.query;

    const vendor = await Vendor.findById(vendorId);
    if (!vendor) {
      errorResponse(res, "Vendor not found", 404);
    }

    const category = await Category.find({
      serviceId: vendor.serviceId,
      cat_id: { $exists: false },
    }).select("name");

    const varients = await VariantType.find({
      serviceId: vendor.serviceId,
    }).select("variantName");

    const data = {
      categories: category,
      variants: varients,
    };

    return res.status(200).json({
      success: true,
      message: "Services retrieved successfully",
      data: services,
    });
  } catch (error) {
    console.error("Error in get services controller:", error);
    errorResponse(res, "Internal server error", 500, error);
  }
});
