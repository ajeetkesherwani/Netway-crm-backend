const Ticket = require("../../../models/ticket");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");
const logTicketActivity = require("../../../utils/logTicketActivity");

exports.updateTicketStatus = catchAsync(async (req, res, next) => {
    const { ticketId } = req.params;
    const { status } = req.body;

    if (!ticketId) return next(new AppError("ticketId is required", 400));
    if (!status) return next(new AppError("status is required", 400));

    const updatedTicket = await Ticket.findByIdAndUpdate(
        ticketId,
        {
            $set: {
                status,
                lastModifiedBy: req.user._id,
                lastModifiedByType: req.user.role,
            },
        },
        { new: true, runValidators: false } // ✅ skip full validation
    );

    if (!updatedTicket) return next(new AppError("Ticket not found", 404));

    await logTicketActivity({
        ticketId,
        activityType: 1, // Status change
        performedBy: req.user._id,
    });

    successResponse(res, "✅ Ticket status updated successfully", updatedTicket);
});
