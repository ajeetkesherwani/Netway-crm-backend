const ProductInventory = require("../../../models/productInventry");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");

exports.deleteInventory = catchAsync(async (req, res, next) => {

    const { id } = req.params;
    if (!id) return next(new AppError("id is required", 400));

    const deleteInventory = await ProductInventory.findByIdAndDelete({ _id: id });
    if (!deleteInventory) return next(new AppError("Inventory not found", 404));

    res.status(200).json({
        status: true,
        message: "inventory deleted successfully",
        data: deleteInventory
    });
});