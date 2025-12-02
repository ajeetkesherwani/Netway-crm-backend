const Category = require("../../../models/category");
const User = require("../../../models/user");
const catchAsync = require("../../../utils/catchAsync");

exports.getServiceCategory = catchAsync(async (req, res, next) => {
  try {
    let serviceId = req.params.serviceId;
    const category = await Category.find({
      serviceId: serviceId,
      cat_id: null,
    });

    return res.status(200).json({
      status: true,
      results: category.length,
      data: category,
    });

    return res.status(200).json({
      success: true,
      message: "Categories retrieved successfully",
      data: categories,
    });
  } catch (error) {
    console.error("Error in get category controller:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
});
