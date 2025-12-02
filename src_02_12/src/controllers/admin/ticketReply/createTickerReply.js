const TicketReply = require("../../../models/ticketReply");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");

exports.createTicketReply = catchAsync(async (req, res, next) => {
    const { ticket, user, description } = req.body;

    if (!ticket) return next(new AppError("ticket Id is required", 400));
    if (!description) return next(new AppError("description is required", 400));

    const createdById = req.user?._id || null;
    const createdBy = req.user?.role || null;

    if (!createdById || !createdBy) {
        return next(new AppError("Unauthorized: no user found", 401));
    }

    const tReply = new TicketReply({
        ticket,
        user,
        description,
        createdBy,
        createdById
    });

    await tReply.save();

    successResponse(res, "Ticket reply created successfully", tReply);

});
