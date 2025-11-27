const Message = require("../../../models/message");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");  


exports.getMessageList = catchAsync(async (req, res, next) => {
    const messages = await Message.find().sort({ createdAt: -1 }).lean();
    return successResponse(res, "Message list fetched successfully", messages);
});