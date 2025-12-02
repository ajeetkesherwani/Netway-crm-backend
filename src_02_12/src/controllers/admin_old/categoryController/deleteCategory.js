const Category = require("../../../models_old/category");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");

exports.deleteCategory = catchAsync(async (req, res) => {
  const id = req.params.id;

  if (!id || !id.trim()) {
    return new AppError(`Id is required.`, 400);
  }

  const deleteCategory = await Category.findByIdAndDelete(id);
  if (!deleteCategory) {
    return new AppError(`Category not found.`, 400);
  }

  return res.status(200).json({
    status: true,
    message: "Category Deleted successfully",
  });
});
