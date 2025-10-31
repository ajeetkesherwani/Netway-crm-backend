const Ticket = require("../../../models/ticket");
const Staff = require("../../../models/Staff");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");
const logTicketActivity = require("../../../utils/logTicketActivity");

// Assign ticket
exports.assignTicket = catchAsync(async (req, res, next) => {

    const { ticketId, staffId } = req.body;

    if (!ticketId) return next(new AppError("Ticket ID is required", 400));
    if (!staffId) return next(new AppError("Staff ID is required", 400));

    // Only admin can assign
    if (req.user.role !== "Admin") {
        return next(new AppError("Only Admin can assign tickets", 403));
    }

    // Check staff exists
    const staff = await Staff.findById(staffId).populate("role", "roleName");
    if (!staff) return next(new AppError("Staff not found", 404));

    // Ensure role is Staff
    if (!staff.role || staff.role.roleName !== "Staff") {
        return next(new AppError("Tickets can only be assigned to Staff", 403));
    }

    // Find ticket
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) return next(new AppError("Ticket not found", 404));

    // Check if already assigned
    if (ticket.assignToId) {
        return next(new AppError("Ticket already assigned to a staff", 400));
    }

    // Assign ticket
    ticket.assignToId = staff._id;
    ticket.status = "Assigned"
    await ticket.save();

    await logTicketActivity({
        ticketId,
        activityType: 0, // Reassign
        performedBy: req.user._id
    });

    // Populate staff 
    const populatedTicket = await Ticket.findById(ticket._id)
        .populate("assignToId", "name email phoneNo staffName");

    successResponse(res, "Ticket assigned successfully", populatedTicket);
});
