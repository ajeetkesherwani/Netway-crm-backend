const Message = require("../../../models/message");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");  

exports.createMessage = catchAsync(async (req, res, next) => {
    const { message } = req.body;
    const userId = req.user?._id; // Logged-in user

    if (!message) {
        return next(new AppError("Message content is required", 400));
    }

    if (!userId) {
        return next(new AppError("User not logged in", 401));
    }

    const newMessage = await Message.create({
        message,
        userId: userId, // Save who sent the message
    });

    return successResponse(res, "Message created successfully", newMessage);
});
