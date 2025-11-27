const Message = require("../../../models/message");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");  

exports.createMessage = catchAsync(async (req, res, next) => {
    const { message } = req.body;
    if (!message) {
        return next(new AppError("Message content is required", 400));
    }
    const newMessage = await Message.create({ message });
    return successResponse(res, "Message created successfully", newMessage);
});