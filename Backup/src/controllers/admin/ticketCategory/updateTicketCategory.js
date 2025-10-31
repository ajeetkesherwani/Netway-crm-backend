const TicketCategory = require("../../../models/ticketCategory");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");

exports.updateTicketCategory = catchAsync(async (req, res, next) => {

    const { categoryId } = req.params;
    if (!categoryId) return next(new AppError("category id is required", 400));

    const { name } = req.body;

    const category = await TicketCategory.findById(categoryId);
    if (!category) return next(new AppError("category not found", 404));

    category.name = name || category.name;

    await category.save();

    successResponse(res, "ticket category updated successfully", category);

});