const UserPlanHistory = require("../../../models/userPlanHistory");
const catchAsync = require("../../../utils/catchAsync");
const AppError = require("../../../utils/AppError");
const { successResponse } = require("../../../utils/responseHandler");

exports.getPlanHistoryByUserId = catchAsync(async (req, res, next) => {

    const userId = req.user._id;

    const history = await UserPlanHistory.find({ userId })
        .sort({ date: -1 })
        .lean();

    if (!history || history.length === 0) {
        return next(new AppError("No plan history found for this user", 404));
    }

    return successResponse(res, 200, "User plan history fetched successfully", history);
});
