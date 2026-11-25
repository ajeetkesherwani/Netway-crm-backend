const StockCategory = require("../../../models/stockCategory");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const normalizeStockQuantities = require("../../../utils/stockQuantity");

exports.updateStockCategory = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const updateData = { ...req.body };
  const restockQuantity =
    updateData.restockQuantity === undefined
      ? 0
      : Number(updateData.restockQuantity);
  const totalQuantity =
    updateData.quantity === undefined ? undefined : Number(updateData.quantity);
  const availableQuantity =
    updateData.availableQuantity === undefined
      ? undefined
      : Number(updateData.availableQuantity);

  delete updateData.restockQuantity;
  delete updateData.quantity;
  delete updateData.availableQuantity;
  delete updateData.assignedQuantity;

  if (!Number.isInteger(restockQuantity) || restockQuantity < 0) {
    return next(new AppError("Restock quantity must be a non-negative whole number", 400));
  }

  if (
    totalQuantity !== undefined &&
    (!Number.isInteger(totalQuantity) || totalQuantity < 0)
  ) {
    return next(new AppError("Total quantity must be a non-negative whole number", 400));
  }

  if (
    availableQuantity !== undefined &&
    (!Number.isInteger(availableQuantity) || availableQuantity < 0)
  ) {
    return next(new AppError("Available quantity must be a non-negative whole number", 400));
  }

  if (updateData.assignedToEngineer === "") {
    delete updateData.assignedToEngineer;
  }
  if (updateData.assignedToUser === "") {
    delete updateData.assignedToUser;
  }

  const stockCategory = await StockCategory.findById(id);
  if (!stockCategory) {
    return next(new AppError("No stock category found with that ID", 404));
  }

  normalizeStockQuantities(stockCategory);

  const assignedStockQuantity =
    Number(stockCategory.quantity) - Number(stockCategory.availableQuantity);
  if (availableQuantity !== undefined) {
    stockCategory.availableQuantity = availableQuantity;
    stockCategory.quantity = assignedStockQuantity + availableQuantity;
  } else if (totalQuantity !== undefined) {
    if (totalQuantity < assignedStockQuantity) {
      return next(
        new AppError("Total quantity cannot be less than the quantity already assigned", 400)
      );
    }

    const stockIncrease = totalQuantity - Number(stockCategory.quantity);
    stockCategory.quantity = totalQuantity;
    stockCategory.availableQuantity += stockIncrease;
  }

  if (restockQuantity > 0) {
    stockCategory.quantity += restockQuantity;
    stockCategory.availableQuantity += restockQuantity;
  }

  stockCategory.set(updateData);
  await stockCategory.save();

  res.status(200).json({
    status: "success",
    message: "Stock Category updated successfully",
    data: {
      stockCategory,
    },
  });
});
