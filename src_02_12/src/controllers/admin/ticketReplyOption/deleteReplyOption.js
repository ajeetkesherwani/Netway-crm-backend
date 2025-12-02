const TicketReplyOption = require("../../../models/ticketReplyOption");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");

exports.deleteTicketReplyOption = catchAsync(async (req, res, next) => {

    const { replyOptionId } = req.params;
    if (!replyOptionId) return next(new AppError("replyOptionId is required", 400));

    const ticketReplyOption = await TicketReplyOption.findByIdAndDelete(replyOptionId);
    if (!ticketReplyOption) return next(new AppError("Ticket reply option not found", 404));

    successResponse(res, "Ticket reply option deleted successfully", ticketReplyOption);

});