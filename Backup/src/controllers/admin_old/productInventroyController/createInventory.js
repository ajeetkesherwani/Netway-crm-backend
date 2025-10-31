const ProductInventory = require("../../../models_old/productInventry");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");

exports.createInventory = catchAsync(async (req, res, next) => {

  const {
    vendor_id,
    service_id,
    category_id,
    subCategory_id,
    product_id,
    inventoryData
  } = req.body;

  if (!vendor_id || !service_id || !category_id || !subCategory_id || !product_id || !inventoryData) {
    return next(new AppError("all fields are required", 400));
  }

  const productInventory = new ProductInventory({
    vendor_id,
    service_id,
    category_id,
    subCategory_id,
    product_id,
    inventoryData
  });

  await productInventory.save();

  res.status(200).json({
    status: true,
    message: "Product inventory created successfully",
    data: productInventory
  });
});