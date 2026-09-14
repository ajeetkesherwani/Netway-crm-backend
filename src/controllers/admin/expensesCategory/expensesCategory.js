const ExpensesCategory = require("../../../models/ExpensesCategory");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");

// Create Expenses Category
exports.createCategory = catchAsync(async (req, res, next) => {
  const { categoryName } = req.body;

  if (!categoryName) {
    return next(new AppError("Category name is required", 400));
  }

  const newCategory = new ExpensesCategory({
    categoryName,
    addedBy: req.user._id,
    addedByModel: req.user.role || "Admin",
    addedByName: req.user.name || "Unknown",
    // date will automatically default to Date.now()
  });

  await newCategory.save();

  res.status(201).json({
    status: "success",
    message: "Expenses category created successfully",
    data: newCategory,
  });
});

// Get all Categories (with search)
exports.getCategories = catchAsync(async (req, res, next) => {
  const { search } = req.query;
  
  let query = {};
  if (search) {
    query.categoryName = { $regex: search, $options: "i" };
  }

  const categories = await ExpensesCategory.find(query).sort({ createdAt: -1 });

  res.status(200).json({
    status: "success",
    results: categories.length,
    data: categories,
  });
});

// Update Category
exports.updateCategory = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { categoryName } = req.body;

  if (!categoryName) {
    return next(new AppError("Category name is required for update", 400));
  }

  const category = await ExpensesCategory.findByIdAndUpdate(
    id,
    { categoryName },
    { new: true, runValidators: true }
  );

  if (!category) {
    return next(new AppError("Category not found", 404));
  }

  res.status(200).json({
    status: "success",
    message: "Expenses category updated successfully",
    data: category,
  });
});

// Delete Category
exports.deleteCategory = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const category = await ExpensesCategory.findByIdAndDelete(id);

  if (!category) {
    return next(new AppError("Category not found", 404));
  }

  res.status(200).json({
    status: "success",
    message: "Expenses category deleted successfully",
  });
});
