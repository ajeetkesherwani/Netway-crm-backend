const Ticket = require("../../../models/ticket");
const TicketReply = require("../../../models/ticketReply");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");
const { createLog } = require("../../../utils/userLogActivity");

exports.userReplyToTicket = catchAsync(async (req, res, next) => {
    const userId = req.user._id;
    const { ticketId } = req.params;
    const { description } = req.body;

    if (!description) {
        return next(new AppError("description is required", 400));
    }

    // Check ticket belongs to user
    const ticket = await Ticket.findOne({ _id: ticketId, userId });
    if (!ticket) {
        return next(new AppError("Ticket not found or unauthorized", 404));
    }

    const reply = await TicketReply.create({
        ticket: ticketId,
        userId,
        description,
        createdBy: "User",
        createdById: userId
    });

    await createLog({
        userId,
        type: "Ticket Reply Added",
        description: `Customer replied to ticket ${ticket.ticketNumber}`,
        details: {
            ticketId: ticket._id,
            ticketNumber: ticket.ticketNumber,
            replyId: reply._id,
            createdById: userId,
            createdByRole: "User",
        },
        addedBy: { id: userId, role: "User" },
        ip: req.ip || req.headers["x-forwarded-for"],
        module: "ticket",
        targetType: "ticket",
        targetId: ticket._id,
        targetName: ticket.ticketNumber,
    });

    return successResponse(res, "Reply added successfully", reply);
});
