const Ticket = require("../../../models/ticket");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");
const logTicketActivity = require("../../../utils/logTicketActivity");

exports.reAssignTicket = catchAsync(async (req, res, next) => {
    const { ticketId, assignToId } = req.body;

    if (!ticketId) return next(new AppError("ticketId is required", 400));
    if (!assignToId) return next(new AppError("assignToId is required", 400));

    const ticket = await Ticket.findById(ticketId);
    if (!ticket) return next(new AppError("Ticket not found", 404));

    // If already assigned, push to reassign history
    if (ticket.assignToId) {
        ticket.reassign = ticket.reassign || [];
        ticket.reassign.push({
            staffId: ticket.assignToId,
            previousStatus: ticket.status,
            reassignedAt: new Date(),
        });
    }

    ticket.assignToId = assignToId;
    ticket.status = "Reassigned";
    await ticket.save();

    await logTicketActivity({
        ticketId,
        activityType: 2, // Reassign
        performedBy: req.user._id,
    });

    successResponse(res, "Ticket reassigned successfully", ticket);
});
