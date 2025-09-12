const ProductInventory = require("../../../models/productInventry.js");
const AppError = require("../../../utils/AppError.js");
const catchAsync = require("../../../utils/catchAsync.js");

exports.getInventory = catchAsync(async (req, res, next) => {
  const inventoryes = await ProductInventory.find().populate({
    path: "inventoryData.variantData.variantType_id",
    model: "VariantType",
    select: "variantName",
  });

  if (!inventoryes) return next(new AppError("Inventory not found", 404));

  res.status(200).json({
    status: true,
    message: "All Inventory found",
    count: inventoryes.length,
    data: inventoryes,
  });
});
