const TicketHistoryTimeline = require("../../../models/ticketHistoryTimeline");
const AppError = require("../../../utils/AppError");
const { successResponse } = require("../../../utils/responseHandler");

exports.getTicketTimeLineHistory = (async (req, res, next) => {

    const { ticketId } = req.params;
    if (!ticketId) return next(new AppError("TicketId is required", 400));

    const timeLine = await TicketHistoryTimeline.findOne({ ticketId });
    if (!timeLine) return next(new AppError("time line History not found", 404));

    successResponse(res, "Ticket time line found successfully", timeLine);

});