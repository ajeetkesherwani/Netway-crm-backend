const ProductInventory = require("../../../models/productInventry");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");

exports.getOneInventory = catchAsync(async (req, res, next) => {

    const { id } = req.params;
    if (!id) return next(new AppError("id is required", 400));

    const inventoryDetails = await ProductInventory.findOne({ _id: id }).populate({
    path: "inventoryData.variantData.variantType_id",
    model: "VariantType",
    select: "variantName" 
  }).populate({
      path: "product_id",
      model: "Products",           
      select: "name",      
    });

  
    if (!inventoryDetails) return next(new AppError("Inventory not found", 404));

    res.status(200).json({
        status: true,
        message: "Inventory In Details",
        data: inventoryDetails
    });
});