const Category = require("../../../models/category");
const catchAsync = require("../../../utils/catchAsync");
const {
  successResponse,
  errorResponse,
} = require("../../../utils/responseHandler");

exports.getSubCategory = catchAsync(async (req, res, next) => {
  try {
    const { categoryId } = req.params;

    const subCategories = await Category.find({ cat_id: categoryId })
      .select("name image")
      .lean();
    if (!subCategories) {
      errorResponse(res, "SubCategories not found", 404);
    }

    successResponse(res, "SubCategories retrieved successfully", subCategories);
  } catch (error) {
    console.error("Error in get services controller:", error);
    errorResponse(res, "Internal server error", 500, error);
  }
});
