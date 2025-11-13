const TicketResolution = require("../../../models/ticketResolution");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");

exports.updateTicketResolution = catchAsync(async (req, res, next) => {

    const { resolutionId } = req.params;
    if (!resolutionId) return next(new AppError("resolutionId is required", 400));

    const { name } = req.body;

    const ticketResolution = await TicketResolution.findById(resolutionId);
    if (!ticketResolution) return next(new AppError("Ticket resolution not found", 404));

    ticketResolution.name = name || ticketResolution.name;

    await ticketResolution.save();

    successResponse(res, "Ticket resolution updated successfully", ticketResolution);

});
