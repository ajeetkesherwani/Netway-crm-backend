const StockProductCategory = require("../../../models/stockProductCategory");
const catchAsync = require("../../../utils/catchAsync");
const AppError = require("../../../utils/AppError");
const { successResponse } = require("../../../utils/responseHandler");

exports.getStockProductCategory = catchAsync(async (req, res, next) => {
    const categories = await StockProductCategory.find().sort({ createdAt: -1 });
    successResponse(res, "Stock product categories fetched successfully", { categories });
});

exports.createStockProductCategory = catchAsync(async (req, res, next) => {
    const { productName, vendor } = req.body;
    if (!productName || !vendor) {
        return next(new AppError("Product Name and Vendor are required", 400));
    }
    const newCategory = await StockProductCategory.create({ productName, vendor });
    successResponse(res, "Stock product category created successfully", { category: newCategory });
});

exports.updateStockProductCategory = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    if (!id) {
        return next(new AppError("Category ID is required", 400));
    }
    const { productName, vendor } = req.body;   

    const updatedCategory = await StockProductCategory.findByIdAndUpdate(
        id,
        { productName, vendor },
        { new: true, runValidators: true }
    );

    if (!updatedCategory) {
        return next(new AppError("No stock product category found with that ID", 404));
    }
    successResponse(res, "Stock product category updated successfully", { category: updatedCategory });
});

exports.deleteStockProductCategory = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const deletedCategory = await StockProductCategory.findByIdAndDelete(id);
    if (!deletedCategory) {
        return next(new AppError("No stock product category found with that ID", 404));
    }   
    successResponse(res, "Stock product category deleted successfully", { category: deletedCategory });
});
