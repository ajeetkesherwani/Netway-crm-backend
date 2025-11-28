const TicketReply = require("../../../models/ticketReply");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");

exports.ticketReplyList = catchAsync(async (req, res, next) => {

    const { ticketId } = req.params;

    if (!ticketId) return next(new AppError("ticketId is required", 400));


    const ticketList = await TicketReply.find({ ticket: ticketId });

    if (!ticketList || ticketList.length === 0) {
        return next(new AppError("ticket Reply not found", 404));
    }

    console.log("ticketList", ticketList);
    successResponse(res, "ticketReply list found", ticketList);
});
