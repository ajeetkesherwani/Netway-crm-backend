const Ticket = require("../../../models/ticket");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");

exports.updateTicketStatus = catchAsync(async (req, res, next) => {

    const { ticketId } = req.params;
    if (!ticketId) return next(new AppError("ticketId is required", 400));

    const { status } = req.body;

    const ticket = await Ticket.findById(ticketId);
    if (!ticket) return next(new AppError("ticket not found", 404));

    ticket.status = status || ticket.status;

    await ticket.save();

    successResponse(res, "Ticket status updated successfully", ticket);

});