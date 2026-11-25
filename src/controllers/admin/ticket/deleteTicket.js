const Ticket = require("../../../models/ticket");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");
const { createLog } = require("../../../utils/userLogActivity");

exports.deleteTicket = catchAsync(async (req, res, next) => {

    const { ticketId } = req.params;
    if (!ticketId) return next(new AppError("ticket id is required", 400));

    const ticket = await Ticket.findById(ticketId);
    if (!ticket) return next(new AppError("ticket not found", 404));

    const deletedTicket = await Ticket.findByIdAndDelete(ticketId);
    if (!deletedTicket) return next(new AppError("ticket not found", 404));
    await createLog({
        userId: ticket.userId,
        type: "Ticket Deleted",
        description: `Ticket ${ticket.ticketNumber} deleted`,
        details: {
            ticketId: ticket._id,
            ticketNumber: ticket.ticketNumber,
            customerName: ticket.personName,
            customerId: ticket.userId,
            status: ticket.status,
            deletedById: req.user._id,
            deletedByRole: req.user.role,
        },
        addedBy: { id: req.user._id, role: req.user.role || "Admin" },
        ip: req.ip || req.headers["x-forwarded-for"],
        module: "ticket",
        targetType: "ticket",
        targetId: ticket._id,
        targetName: ticket.ticketNumber,
    });

    successResponse(res, "ticket deleted succssfully", ticket);

});