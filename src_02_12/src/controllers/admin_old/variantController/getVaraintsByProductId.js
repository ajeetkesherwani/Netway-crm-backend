const Product = require("../../../models_old/products");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");

exports.getVariantsByProductId = catchAsync(async (req, res, next) => {
    const { productId } = req.params;

    const product = await Product.findById(productId)
        .select("variants name")
        .populate("variants.VariantTypeId", "variantName")
        .lean();



    if (!product) {
        return next(new AppError("Product not found", 404));
    }

    if (!product.variants || product.variants.length === 0) {
        return next(new AppError("No variants available for this product", 404));
    }


    const variantData = product.variants.map((variant) => ({
        _id: variant._id,
        VariantTypeId: variant.VariantTypeId._id,
        variantName: variant.VariantTypeId.variantName,
        value: variant.value,
    }));




    successResponse(res, "Variants fetch successfully for this product", {
        productName: product.name,
        variants: variantData
    })
});
