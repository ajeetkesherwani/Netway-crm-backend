const User = require("../../../models/user");
const PurchasedPlan = require("../../../models/purchasedPlan");
const catchAsync = require("../../../utils/catchAsync");
const AppError = require("../../../utils/AppError");
const { successResponse } = require("../../../utils/responseHandler");

exports.getRenewedUsersCountByFilter = catchAsync(async (req, res, next) => {
    const { filter, month, year } = req.query;
    const { role, _id } = req.user;

    const filterValue = filter || "day";
    const currentDate = new Date();
    const targetYear = year || currentDate.getFullYear();

    let targetEndMonth;
    if (month) {
        targetEndMonth = parseInt(month);
    } else {
        targetEndMonth = parseInt(targetYear) === currentDate.getFullYear() ? currentDate.getMonth() + 1 : 12;
    }

    const startDate = new Date(targetYear, 0, 1);
    const endDate = new Date(targetYear, targetEndMonth, 0, 23, 59, 59);

    // Active users filter
    let matchUserQuery = { status: "active", createdAt: { $gte: startDate, $lte: endDate } };
    if (role === "reseller" || role === "lco") matchUserQuery.referredBy = _id;

    const activeUsers = await User.find(matchUserQuery).select("_id createdAt").lean();
    const userIds = activeUsers.map(u => u._id);

    // Find renewed plans
    const renewedPlans = await PurchasedPlan.find({
        userId: { $in: userIds },
        isRenewed: true
    }).select("userId").lean();

    const renewedUserIds = renewedPlans.map(p => p.userId.toString());
    const renewedUsers = activeUsers.filter(u => renewedUserIds.includes(u._id.toString()));

    // Aggregate counts only
    let aggregated = {};
    if (filterValue === "day") {
        aggregated = renewedUsers.reduce((acc, user) => {
            const date = new Date(user.createdAt);
            const day = date.getUTCDate();
            const monthNum = date.getUTCMonth() + 1;
            const yearNum = date.getUTCFullYear();
            const key = `${day}-${monthNum}-${yearNum}`;
            if (!acc[key]) acc[key] = { _id: { day, month: monthNum, year: yearNum }, totalUsers: 0 };
            acc[key].totalUsers += 1;
            return acc;
        }, {});
    } else if (filterValue === "week") {
        aggregated = renewedUsers.reduce((acc, user) => {
            const date = new Date(user.createdAt);
            const dayOfMonth = date.getUTCDate();
            const monthNum = date.getUTCMonth() + 1;
            const yearNum = date.getUTCFullYear();
            const monthWeek = dayOfMonth <= 7 ? 1 : dayOfMonth <= 14 ? 2 : dayOfMonth <= 21 ? 3 : dayOfMonth <= 28 ? 4 : 5;
            const key = `${monthWeek}-${monthNum}-${yearNum}`;
            if (!acc[key]) acc[key] = { _id: { monthWeek, month: monthNum, year: yearNum }, totalUsers: 0 };
            acc[key].totalUsers += 1;
            return acc;
        }, {});
    } else if (filterValue === "month") {
        aggregated = renewedUsers.reduce((acc, user) => {
            const date = new Date(user.createdAt);
            const monthNum = date.getUTCMonth() + 1;
            const yearNum = date.getUTCFullYear();
            const key = `${monthNum}-${yearNum}`;
            if (!acc[key]) acc[key] = { _id: { month: monthNum, year: yearNum }, totalUsers: 0 };
            acc[key].totalUsers += 1;
            return acc;
        }, {});
    } else {
        return next(new AppError("Invalid filter. Use day/week/month", 400));
    }

    return successResponse(res, `${filterValue}-wise renewed user counts`, Object.values(aggregated));
});
