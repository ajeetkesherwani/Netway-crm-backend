const Ticket = require("../../../models/ticket");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");
const logTicketActivity = require("../../../utils/logTicketActivity");

exports.updateTicketStatus = catchAsync(async (req, res, next) => {

    const { ticketId } = req.params;
    if (!ticketId) return next(new AppError("ticketId is required", 400));

    const { status } = req.body;

    const ticket = await Ticket.findById(ticketId);
    if (!ticket) return next(new AppError("ticket not found", 404));

    ticket.status = status || ticket.status;

    ticket.lastModifiedBy = req.user._id;
    ticket.lastModifiedByType = req.user.role;

    await ticket.save();

    await logTicketActivity({
        ticketId,
        activityType: 1, // Status
        performedBy: req.user._id
    });

    successResponse(res, "Ticket status updated successfully", ticket);

});