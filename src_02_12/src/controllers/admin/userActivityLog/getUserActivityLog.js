const ActivityLog = require("../../../models/activityLog");
const catchAsync = require("../../../utils/catchAsync");
const AppError = require("../../../utils/AppError");
const { successResponse } = require("../../../utils/successResponse");

exports.getUserActivityLog = catchAsync(async (req, res, next) => {
    const { userId } = req.params;      
    if (!userId) {
        return next(new AppError("userId is required", 400));
    }      
    const logs = await ActivityLog.find({ userId }).sort({ createdAt: -1 });

    successResponse(res, "User activity logs fetched successfully", { logs });
});