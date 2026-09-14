const StockCategory = require("../../../models/stockCategory");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");

exports.updateStockCategory = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const updateData = req.body;

  const stockCategory = await StockCategory.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });

  if (!stockCategory) {
    return next(new AppError("No stock category found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    message: "Stock Category updated successfully",
    data: {
      stockCategory,
    },
  });
});
