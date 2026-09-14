const StockCategory = require("../../../models/stockCategory");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");

exports.deleteStockCategory = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const stockCategory = await StockCategory.findByIdAndDelete(id);

  if (!stockCategory) {
    return next(new AppError("No stock category found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    message: "Stock Category deleted successfully",
    data: null,
  });
});
