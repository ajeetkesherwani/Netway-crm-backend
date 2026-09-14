const StockCategory = require("../../../models/stockCategory");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");

exports.assignToEngineer = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { staffId, comment } = req.body;

  if (!staffId) {
    return next(new AppError("Engineer/Staff ID is required for assignment", 400));
  }

  const stockCategory = await StockCategory.findByIdAndUpdate(
    id,
    {
      assignedToEngineer: staffId,
      assignedToUser: null, // Reset user assignment if it had one
      assignComment: comment || "",
      assignDate: new Date(),
      status: "Assigned to Engineer",
    },
    { new: true, runValidators: true }
  );

  if (!stockCategory) {
    return next(new AppError("No stock category found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    message: "Stock Category assigned to Engineer successfully",
    data: {
      stockCategory,
    },
  });
});

exports.assignToUser = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { userId, comment } = req.body;

  if (!userId) {
    return next(new AppError("User ID is required for assignment", 400));
  }

  const stockCategory = await StockCategory.findByIdAndUpdate(
    id,
    {
      assignedToUser: userId,
      assignedToEngineer: null, // Reset engineer assignment if it had one
      assignComment: comment || "",
      assignDate: new Date(),
      status: "Assigned to User",
    },
    { new: true, runValidators: true }
  );

  if (!stockCategory) {
    return next(new AppError("No stock category found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    message: "Stock Category assigned to User successfully",
    data: {
      stockCategory,
    },
  });
});

exports.reassignToEngineer = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { staffId, comment } = req.body;

  if (!staffId) {
    return next(new AppError("Engineer/Staff ID is required for reassignment", 400));
  }

  const stockCategory = await StockCategory.findById(id);

  if (!stockCategory) {
    return next(new AppError("No stock category found with that ID", 404));
  }

  if (stockCategory.status !== "Assigned to Engineer" || !stockCategory.assignedToEngineer) {
    return next(new AppError("This stock is not currently assigned to an engineer. It can only be reassigned to another engineer if already assigned to one.", 400));
  }

  stockCategory.assignedToEngineer = staffId;
  stockCategory.assignComment = comment || "";
  stockCategory.assignDate = new Date();
  await stockCategory.save();

  res.status(200).json({
    status: "success",
    message: "Stock Category reassigned to Engineer successfully",
    data: {
      stockCategory,
    },
  });
});

exports.reassignToUser = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { userId, comment } = req.body;

  if (!userId) {
    return next(new AppError("User ID is required for reassignment", 400));
  }

  const stockCategory = await StockCategory.findById(id);

  if (!stockCategory) {
    return next(new AppError("No stock category found with that ID", 404));
  }

  if (stockCategory.status !== "Assigned to User" || !stockCategory.assignedToUser) {
    return next(new AppError("This stock is not currently assigned to a user. It can only be reassigned to another user if already assigned to one.", 400));
  }

  stockCategory.assignedToUser = userId;
  stockCategory.assignComment = comment || "";
  stockCategory.assignDate = new Date();
  await stockCategory.save();

  res.status(200).json({
    status: "success",
    message: "Stock Category reassigned to User successfully",
    data: {
      stockCategory,
    },
  });
});
