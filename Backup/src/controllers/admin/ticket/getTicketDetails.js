const Ticket = require("../../../models/ticket");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");

exports.getTicketDetails = catchAsync(async (req, res, next) => {

    const { ticketId } = req.params;
    if (!ticketId) return next(new AppError("ticketId is required", 404));

    const ticket = await Ticket.findById(ticketId).populate([
        { path: "userId", select: "fullName email phone address isActive walletBalance" },
        { path: "assignToId", select: "name email phoneNo staffName" }
    ]);
    if (!ticket) return next(new AppError("ticket not found", 404));

    successResponse(res, "ticket Details found successfully", ticket);

});