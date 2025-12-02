const TicketCategory = require("../../../models/ticketCategory");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");

exports.deleteTicketCategory = catchAsync(async (req, res, next) => {

    const { categoryId } = req.params;
    if (!categoryId) return next(new AppError("categoryId is required", 400));

    const category = await TicketCategory.findByIdAndDelete(categoryId);
    if (!category) return next(new AppError("category not found", 404));

    successResponse(res, "category deleted successfully", category);

});