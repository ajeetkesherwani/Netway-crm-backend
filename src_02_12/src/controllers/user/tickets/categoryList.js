const TicketCategory = require("../../../models/ticketCategory");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");

exports.getUserTicketCategoryList = catchAsync(async (req, res, next) => {

    const ticketCategory = await TicketCategory.find();
    if (!ticketCategory) return next(new AppError("ticket category not found", 404));

    successResponse(res, "Ticket category List found successfully", ticketCategory);

});