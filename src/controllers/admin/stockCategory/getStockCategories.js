const StockCategory = require("../../../models/stockCategory");
const catchAsync = require("../../../utils/catchAsync");

exports.getStockCategories = catchAsync(async (req, res, next) => {
  const { productName, vendor, serialNo, macAddress } = req.query;

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

  res.status(200).json({
    status: "success",
    results: stockCategories.length,
    data: {
      stockCategories,
    },
  });
});
