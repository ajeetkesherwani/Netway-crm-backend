const Products = require("../../../models/products");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");

exports.getLiveOrders = catchAsync(async (req, res, next) => {

    const vendorId = req.vendor._id;
    if(!vendorId) return next(new AppError("vendor Id is required ", 400));

    const products = await Products.find({ isStock: true, vendor: vendorId })
        .populate("categoryId", "name")
        .populate({
            path: "variants.VariantTypeId", 
            model: "VariantType",           
            select: "variantName"                   
        })
        .select("name primary_image isStock categoryId variants")
        .sort({ createdAt: -1 });

    const result = products.map(prod => ({
        productId: prod._id,
        name: prod.name,
        image: prod.primary_image,
        isStock: prod.isStock,
        category: prod.categoryId?.name || "N/A",
        variants: prod.variants.map(v => ({
            type: v.VariantTypeId?.variantName || "Unknown",
            values: v.value || []
        }))
    }));

    successResponse(res, "All products found", result);
});
