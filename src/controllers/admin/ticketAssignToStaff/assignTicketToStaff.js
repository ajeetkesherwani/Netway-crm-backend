const Ticket = require("../../../models/ticket");
const Staff = require("../../../models/Staff");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");
const logTicketActivity = require("../../../utils/logTicketActivity");
const { createLog } = require("../../../utils/userLogActivity");

// Assign ticket
exports.assignTicket = catchAsync(async (req, res, next) => {

    const { ticketId, assignToId } = req.body;

    if (!ticketId) return next(new AppError("Ticket ID is required", 400));
    if (!assignToId) return next(new AppError("assignToId is required", 400));


    // Find ticket
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) return next(new AppError("Ticket not found", 404));

    // Check if already assigned
    if (ticket.assignToId && ticket.assignToId !== null) {
        return next(new AppError("Ticket already assigned", 400));
    }


    // Assign ticket
    ticket.assignToId = assignToId;
    ticket.status = "Assigned"
    await ticket.save();

    await logTicketActivity({
        ticketId,
        activityType: 0, // Reassign
        performedBy: req.user._id
    });

    await createLog({
        userId: ticket.userId,
        type: "Ticket Assigned",
        description: `Ticket ${ticket.ticketNumber} assigned to staff`,
        details: {
            ticketId: ticket._id,
            ticketNumber: ticket.ticketNumber,
            customerName: ticket.personName,
            assignedToId,
            previousStatus: "Open",
            newStatus: ticket.status,
        },
        addedBy: { id: req.user._id, role: req.user.role || "Admin" },
        ip: req.ip || req.headers["x-forwarded-for"],
        module: "ticket",
        targetType: "ticket",
        targetId: ticket._id,
        targetName: ticket.ticketNumber,
    });

    // Populate staff 
    const populatedTicket = await Ticket.findById(ticket._id)
    // .populate("assignToId", "name email phoneNo staffName");

    successResponse(res, "Ticket assigned successfully", populatedTicket);
});
