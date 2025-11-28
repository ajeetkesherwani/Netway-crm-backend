const Message = require("../../../models/message");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");

exports.getSupportMessageList = catchAsync(async (req, res, next) => {
    const messages = await Message.find()
        .populate("userId", "generalInformation.name generalInformation.email generalInformation.phone") 
        .sort({ createdAt: -1 })
        .lean();

    return successResponse(
        res,
        "Message list fetched successfully",
        messages
    );
});
