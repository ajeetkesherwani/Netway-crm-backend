const Ticket = require("../../../models/ticket");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");
const logTicketActivity = require("../../../utils/logTicketActivity");

exports.reAssignTicket = catchAsync(async (req, res, next) => {
    const { ticketId, staffId } = req.body;

    if (!ticketId) return next(new AppError("ticketId is required", 400));
    if (!staffId) return next(new AppError("staffId is required", 400));

    const ticket = await Ticket.findById(ticketId);

    if (!ticket) return next(new AppError("Ticket not found", 404));

    // If already assigned to the staff
    if (ticket.assignToId?.toString() === staffId) {
        return next(new AppError("Ticket is already assigned to this staff", 400));
    }

    // If already assigned add to reassign history
    if (ticket.assignToId) {
        ticket.reassign.push({
            staffId: ticket.assignToId,
            currentStatus: ticket.status
        });
    }


    ticket.assignToId = staffId;
    ticket.status = "Assigned";

    await ticket.save();

    await logTicketActivity({
        ticketId,
        activityType: 2, // Reassign
        performedBy: req.user._id
    });

    // Populate assignToId and reassign
    const updatedTicket = await Ticket.findById(ticketId)
        .populate("assignToId", "name email phoneNo staffName")
        .populate("reassign.staffId", "name email phoneNo staffName");

    successResponse(res, "Ticket reassigned successfully", updatedTicket);
});
