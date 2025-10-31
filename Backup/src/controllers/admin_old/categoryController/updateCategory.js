const Category = require("../../../models_old/category");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");

exports.updateCategory = catchAsync(async (req, res) => {
  let categoryId = req.params.id;
  console.log((categoryId, req.body));
  let { name, cat_id, type, serviceId } = req.body;

  if (!name || !name.trim()) return new AppError(`Name is required`, 400);

  let category = await Category.findById(categoryId);
  if (!category) {
    return res.status(404).json({
      success: false,
      message: "Category not found",
    });
  }

  let imagePath = category.image;
  if (req.files && req.files.image) {
    const url = `${req.files.image[0].destination}/${req.files.image[0].filename}`;
    imagePath = url;
  }

  category.name = name || category.name;
  category.cat_id = cat_id || category.cat_id;
  category.type = type || category.type;
  category.serviceId = serviceId || category.serviceId;
  category.image = imagePath;

  await category.save();

  return res.status(200).json({
    status: true,
    message: "Category updated successfully",
    data: { category },
  });
});
