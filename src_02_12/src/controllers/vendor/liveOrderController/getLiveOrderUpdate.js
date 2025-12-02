const Products = require("../../../models/products");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");

exports.liveOrderUpdate = catchAsync(async (req, res, next) => {

    const vendorId = req.vendor._id;

    const  productId  = req.params.id;
   
    if (!productId) return next(new AppError("productId is required", 400));

    const { isStock } = req.body;

    const product = await Products.findOne({ _id: productId, vendor: vendorId });
    if (!product) return next(new AppError("product not found", 404));

    product.isStock = isStock;
    await product.save();

    successResponse(res, "Product isStock is updated successfully", {
        productId: product._id,
        isStock: product.isStock,
    });
});