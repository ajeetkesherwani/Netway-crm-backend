const TicketResolution = require("../../../models/ticketResolution");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");

exports.createResolution = catchAsync(async (req, res, next) => {
    const { name } = req.body;

    if (!name) return next(new AppError("name is required", 400));

    // Dynamic createdBy and createdById
    const createdById = req.user?._id || null;
    const createdBy = req.user?.role || null;

    if (!createdById || !createdBy) {
        return next(new AppError("Unauthorized: no user found", 401));
    }

    const ticketResolution = new TicketResolution({
        name,
        createdBy,
        createdById
    });

    await ticketResolution.save();

    successResponse(res, "Ticket resolution is created successfully", ticketResolution);
});
