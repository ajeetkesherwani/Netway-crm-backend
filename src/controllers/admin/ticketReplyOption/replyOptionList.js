const TicketReplyOption = require("../../../models/ticketReplyOption");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");

exports.getTicketReplyOptionList = catchAsync(async (req, res, next) => {
    const ticketReplyOptions = await TicketReplyOption.find().select("optionText");
    if (!ticketReplyOptions) return next(new AppError("No ticket reply options found", 404));

    successResponse(res, "Ticket reply options found successfully", ticketReplyOptions);
});