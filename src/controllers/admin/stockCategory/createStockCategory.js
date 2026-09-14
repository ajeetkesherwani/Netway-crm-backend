const StockCategory = require("../../../models/stockCategory");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");

exports.createStockCategory = catchAsync(async (req, res, next) => {
  const {
    productName,
    vendor,
    serialNo,
    macAddress,
    quantity,
    stockAlertQuantity,
    description,
  } = req.body;

  if (!productName || !vendor || !serialNo || quantity === undefined) {
    return next(new AppError("Product Name, Vendor, Serial No, and Quantity are required", 400));
  }

  const stockCategory = await StockCategory.create({
    productName,
    vendor,
    serialNo,
    macAddress,
    quantity,
    stockAlertQuantity,
    description,
  });

  res.status(201).json({
    status: "success",
    message: "Stock Category created successfully",
    data: {
      stockCategory,
    },
  });
});
