const Expense = require("../../../models/expense");
const ExpensesCategory = require("../../../models/ExpensesCategory");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");

// Create Expense
exports.createExpense = catchAsync(async (req, res, next) => {
  const { expensesCategory, expenseDate, description, amount, paymentMode } = req.body;

  if (!expensesCategory || !expenseDate || !amount || !paymentMode) {
    return next(new AppError("expensesCategory, expenseDate, amount, and paymentMode are required", 400));
  }

  const newExpense = new Expense({
    expensesCategory,
    expenseDate,
    description,
    amount,
    paymentMode,
    addedBy: req.user._id,
    addedByModel: req.user.role || "Admin",
    addedByName: req.user.name || "Unknown",
  });

  await newExpense.save();

  res.status(201).json({
    status: "success",
    message: "Expense created successfully",
    data: newExpense,
  });
});

// Get all Expenses (with filters)
exports.getExpenses = catchAsync(async (req, res, next) => {
  const { fromDate, toDate, paymentMode, search } = req.query;
  
  let query = {};

  // Date filter
  if (fromDate || toDate) {
    query.expenseDate = {};
    if (fromDate) query.expenseDate.$gte = new Date(fromDate);
    if (toDate) query.expenseDate.$lte = new Date(toDate);
  }

  // Payment mode filter
  if (paymentMode) {
    query.paymentMode = paymentMode;
  }

  // Search by category name
  if (search) {
    const categories = await ExpensesCategory.find({
      categoryName: { $regex: search, $options: "i" }
    }).select("_id");
    
    const categoryIds = categories.map((cat) => cat._id);
    query.expensesCategory = { $in: categoryIds };
  }

  const expenses = await Expense.find(query)
    .populate("expensesCategory", "categoryName")
    .sort({ expenseDate: -1, createdAt: -1 });

  res.status(200).json({
    status: "success",
    results: expenses.length,
    data: expenses,
  });
});

// Update Expense
exports.updateExpense = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const updates = req.body;

  const expense = await Expense.findByIdAndUpdate(
    id,
    updates,
    { new: true, runValidators: true }
  ).populate("expensesCategory", "categoryName");

  if (!expense) {
    return next(new AppError("Expense not found", 404));
  }

  res.status(200).json({
    status: "success",
    message: "Expense updated successfully",
    data: expense,
  });
});

// Delete Expense
exports.deleteExpense = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const expense = await Expense.findByIdAndDelete(id);

  if (!expense) {
    return next(new AppError("Expense not found", 404));
  }

  res.status(200).json({
    status: "success",
    message: "Expense deleted successfully",
  });
});
