const TicketReplyOption = require("../../../models/ticketReplyOption");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");

exports.createReplyOption = catchAsync(async (req, res, next) => {
    const { optionText } = req.body;
    console.log("Request Body:", req.body);

    if (!optionText) return next(new AppError("optionText is required", 400));

    // Dynamic createdBy and createdById
    const createdById = req.user?._id || null;
    const createdBy = req.user?.role || null;

    if (!createdById || !createdBy) {
        return next(new AppError("Unauthorized: no user found", 401));
    }

    const ticketReplyOption = new TicketReplyOption({
        optionText,
        createdBy,
        createdById
    });

    await ticketReplyOption.save();

    successResponse(res, "Ticket reply option is created successfully", ticketReplyOption);
});
