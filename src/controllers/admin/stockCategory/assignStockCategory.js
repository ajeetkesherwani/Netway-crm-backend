const StockCategory = require("../../../models/stockCategory");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const normalizeStockQuantities = require("../../../utils/stockQuantity");

const allocateStock = async (id, quantity, assignment) => {
  const currentStock = await StockCategory.findById(id);

  if (!currentStock) {
    throw new AppError("No stock category found with that ID", 404);
  }

  if (normalizeStockQuantities(currentStock)) {
    await currentStock.save();
  }

  const allocatedQuantity =
    quantity === undefined ? currentStock.availableQuantity : quantity;

  if (!Number.isInteger(allocatedQuantity) || allocatedQuantity <= 0) {
    throw new AppError("Quantity must be a positive whole number", 400);
  }

  const stockCategory = await StockCategory.findOneAndUpdate(
    { _id: id, availableQuantity: { $gte: allocatedQuantity } },
    {
      $inc: { availableQuantity: -allocatedQuantity },
      $set: { ...assignment, assignedQuantity: allocatedQuantity },
    },
    { new: true, runValidators: true }
  );

  if (!stockCategory) {
    throw new AppError("Insufficient available stock quantity", 400);
  }

  return stockCategory;
};

exports.assignToEngineer = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { staffId, comment, quantity } = req.body;

  if (!staffId) {
    return next(new AppError("Engineer/Staff ID is required for assignment", 400));
  }

  const stockCategory = await allocateStock(
    id,
    quantity,
    {
      assignedToEngineer: staffId,
      assignedToUser: null,
      assignComment: comment || "",
      assignDate: new Date(),
      status: "Assigned to Engineer",
    }
  );

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
  const { userId, comment, quantity } = req.body;

  if (!userId) {
    return next(new AppError("User ID is required for assignment", 400));
  }

  const stockCategory = await allocateStock(
    id,
    quantity,
    {
      assignedToUser: userId,
      assignedToEngineer: null,
      assignComment: comment || "",
      assignDate: new Date(),
      status: "Assigned to User",
    }
  );

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
