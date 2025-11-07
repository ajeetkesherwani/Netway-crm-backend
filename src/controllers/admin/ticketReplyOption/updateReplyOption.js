const TicketReplyOption = require("../../../models/ticketReplyOption");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");

exports.updateTicketReplyOption = catchAsync(async (req, res, next) => {

    const { replyOptionId } = req.params;
    if (!replyOptionId) return next(new AppError("replyOptionId is required", 400));

    const { optionText } = req.body;

    const ticketReplyOption = await TicketReplyOption.findById(replyOptionId);
    if (!ticketReplyOption) return next(new AppError("Ticket reply option not found", 404));

    ticketReplyOption.optionText = optionText || ticketReplyOption.optionText;

    await ticketReplyOption.save();

    successResponse(res, "Ticket reply option updated successfully", ticketReplyOption);

});
