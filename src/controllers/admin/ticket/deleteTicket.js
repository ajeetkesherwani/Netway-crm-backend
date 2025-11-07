const Ticket = require("../../../models/ticket");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");

exports.deleteTicket = catchAsync(async (req, res, next) => {

    const { ticketId } = req.params;
    if (!ticketId) return next(new AppError("ticket id is required", 400));

    const ticket = await Ticket.findByIdAndDelete({ ticketId });
    if (!ticket) return next(new AppError("ticket not found", 404));

    successResponse(res, "ticket deleted succssfully", ticket);

});