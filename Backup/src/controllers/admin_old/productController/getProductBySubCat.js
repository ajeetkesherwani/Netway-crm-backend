const Product = require("../../../models_old/products");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");

exports.getProductBySubCat = catchAsync(async(req, res, next) => {

    const { subCatId } = req.params;

    if(!subCatId) return next(new AppError("subCatId is required", 400));

    const getProduct = await Product.find({ subCategoryId: subCatId })
    .select("name")
    .lean();
    
     successResponse(res, "Product find by subCategoryId", getProduct );

});