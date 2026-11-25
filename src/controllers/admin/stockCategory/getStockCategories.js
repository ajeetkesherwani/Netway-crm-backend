const StockCategory = require("../../../models/stockCategory");
const catchAsync = require("../../../utils/catchAsync");
const normalizeStockQuantities = require("../../../utils/stockQuantity");

exports.getStockCategories = catchAsync(async (req, res, next) => {
  const { productName, vendor, serialNo, macAddress, availableOnly } = req.query;

  const filter = {};

  if (productName) {
    filter.productName = { $regex: productName, $options: "i" };
  }
  if (vendor) {
    filter.vendor = { $regex: vendor, $options: "i" };
  }
  if (serialNo) {
    filter.serialNo = { $regex: serialNo, $options: "i" };
  }
  if (macAddress) {
    filter.macAddress = { $regex: macAddress, $options: "i" };
  }
  const stockCategories = await StockCategory.find(filter)
    .populate("assignedToEngineer", "name")
    .populate("assignedToUser", "generalInformation.name");
  const normalizedStockCategories = stockCategories.map((stockCategory) => {
    const stock = stockCategory.toObject();
    normalizeStockQuantities(stock);
    return stock;
  });
  const filteredStockCategories =
    availableOnly === "true"
      ? normalizedStockCategories.filter((stock) => stock.availableQuantity > 0)
      : normalizedStockCategories;

  res.status(200).json({
    status: "success",
    results: filteredStockCategories.length,
    data: {
      stockCategories: filteredStockCategories,
    },
  });
});
