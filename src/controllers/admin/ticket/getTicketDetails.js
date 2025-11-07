const Ticket = require("../../../models/ticket");
const TicketReply = require("../../../models/ticketReply");
const TicketTimeline = require("../../../models/ticketHistoryTimeline");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");

exports.getTicketDetails = catchAsync(async (req, res, next) => {

    const { ticketId } = req.params;
    if (!ticketId) return next(new AppError("ticketId is required", 404));

    const ticket = await Ticket.findById(ticketId).populate([
        { path: "userId", select: "generalInformation.name generalInformation.email generalInformation.phone generalInformation.address isActive walletBalance" },
        { path: "assignToId", select: "name email phoneNo staffName" },
        { path: "category", select: "name" },
        { path: "createdById", select: "name" }
    ]).lean();

    const ticketReplies = await TicketReply.find({ ticket: ticketId })
        .populate("createdById","name")
        .select("description createdAt createdBy");

    const ticketTimeline = await TicketTimeline.find({ ticketId: ticketId })
    .populate('activities.performedBy',"name");

    if (!ticket) return next(new AppError("ticket not found", 404));

    successResponse(res, "ticket Details found successfully", { ticket, replies: ticketReplies, timeline: ticketTimeline });

});