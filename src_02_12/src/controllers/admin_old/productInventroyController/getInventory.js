const ProductInventory = require("../../../models_old/productInventry.js");
const AppError = require("../../../utils/AppError.js");
const catchAsync = require("../../../utils/catchAsync.js");
const paginate = require("../../../utils/paginate.js");

exports.getInventory = catchAsync(async (req, res, next) => {

const { page, limit } = req.query;

const inventories = await paginate(ProductInventory, {}, {
    page,
    limit,
    sort: { createdAt: -1 },
    populate: [
      {
        path: "inventoryData.variantData.variantType_id",
        model: "VariantType",
        select: "variantName",
      },
      {
        path: "product_id",
        model: "Products",
        select: "name",
      },
    ],
  });

  if (!inventories || inventories.paginateData.length ===0 ) return next(new AppError("Inventory not found", 404));

  res.status(200).json({
    status: true,
    message: "All Inventory found",
    count: inventories.paginateData.length,
    data: inventories,
  });
});
