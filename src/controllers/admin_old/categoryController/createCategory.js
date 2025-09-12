const Category = require("../../../models_old/category");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");

exports.createCategory = catchAsync(async (req, res) => {
  let { name, cat_id, type, serviceId } = req.body;

  if (!name || !name.trim()) return new AppError(`name is required,`, 400);
  if (!serviceId) return new AppError(`serviceId is required,`, 400);

  let imagePath;
  if (req.files && req.files.image) {
    const url = `${req.files.image[0].destination}/${req.files.image[0].filename}`;
    imagePath = url;
  } else {
    imagePath = "";
  }

  let category;
  let message;
  if (cat_id) {
    category = new Category({
      name,
      image: imagePath,
      cat_id,
      type,
      serviceId,
    });
    message = "Sub Category added successfully";
  } else {
    category = new Category({ name, image: imagePath, type, serviceId });
    message = "Category added successfully";
  }

  await category.save();

  return res.status(201).json({
    status: true,
    message: message,
    data: { category },
  });
});
