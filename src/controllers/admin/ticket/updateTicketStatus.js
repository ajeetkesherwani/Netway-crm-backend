const Ticket = require("../../../models/ticket");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");
const logTicketActivity = require("../../../utils/logTicketActivity");
const { isValidObjectId } = require("mongoose");
const { createLog } = require("../../../utils/userLogActivity");

exports.updateTicketStatus = catchAsync(async (req, res, next) => {
  const { ticketId } = req.params;
  const { status, resolution } = req.body;

  if (!ticketId) return next(new AppError("ticketId is required", 400));
  if (!status) return next(new AppError("status is required", 400));
  if (resolution && !isValidObjectId(resolution)) {
    return next(new AppError("resolutionId is not valid", 400));
  }

  const ticketBeforeUpdate = await Ticket.findById(ticketId);
  if (!ticketBeforeUpdate) return next(new AppError("Ticket not found", 404));

  const updateQuery = {
    status,
    lastModifiedBy: req.user._id,
    lastModifiedByType: req.user.role,
  };

  if (resolution) updateQuery["resolution"] = resolution;

  const updatedTicket = await Ticket.findByIdAndUpdate(
    ticketId,
    {
      $set: updateQuery,
    },
    { new: true, runValidators: false }
  );

  if (!updatedTicket) return next(new AppError("Ticket not found", 404));

  await logTicketActivity({
    ticketId,
    activityType: 1, // Status change
    performedBy: req.user._id,
  });

  await createLog({
    userId: updatedTicket.userId,
    type: "Ticket Status Updated",
    description: `Ticket ${updatedTicket.ticketNumber} status changed from ${ticketBeforeUpdate.status} to ${updatedTicket.status}`,
    details: {
      ticketId: updatedTicket._id,
      ticketNumber: updatedTicket.ticketNumber,
      customerId: updatedTicket.userId,
      previousStatus: ticketBeforeUpdate.status,
      newStatus: updatedTicket.status,
      resolutionId: resolution || ticketBeforeUpdate.resolution,
      updatedById: req.user._id,
      updatedByRole: req.user.role,
    },
    addedBy: { id: req.user._id, role: req.user.role || "Admin" },
    ip: req.ip || req.headers["x-forwarded-for"],
    module: "ticket",
    targetType: "ticket",
    targetId: updatedTicket._id,
    targetName: updatedTicket.ticketNumber,
  });

  successResponse(res, "✅ Ticket status updated successfully", updatedTicket);
});
