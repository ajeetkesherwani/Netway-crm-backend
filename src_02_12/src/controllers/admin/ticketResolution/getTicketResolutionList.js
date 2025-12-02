const TicketResolutionOption = require("../../../models/ticketResolution");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");

exports.getTicketResolutionList = catchAsync(async (req, res, next) => {
    const ticketReplyOptions = await TicketResolutionOption.find().select("name");
    if (!ticketReplyOptions) return next(new AppError("No ticket reply options found", 404));

    successResponse(res, "Ticket reply options found successfully", ticketReplyOptions);
});