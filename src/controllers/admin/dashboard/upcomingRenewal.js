const User = require("../../../models/user");
const PurchasedPlan = require("../../../models/purchasedPlan");
const catchAsync = require("../../../utils/catchAsync");
const AppError = require("../../../utils/AppError");
const { successResponse } = require("../../../utils/responseHandler");

exports.getUpcomingRenewalUsersCount = catchAsync(async (req, res, next) => {
    const { filter, month, year } = req.query;
    const { role, _id } = req.user;

    const filterValue = filter || "day";
    const currentDate = new Date();
    const targetYear = parseInt(year) || currentDate.getFullYear();

    let targetEndMonth;
    if (month) {
        targetEndMonth = parseInt(month);
    } else {
        targetEndMonth =
            targetYear === currentDate.getFullYear()
                ? currentDate.getMonth() + 1
                : 12;
    }

    const startDate = new Date(targetYear, 0, 1);
    const endDate = new Date(targetYear, targetEndMonth, 0, 23, 59, 59);

    // Get all active users in range
    const userQuery = { status: "active", createdAt: { $gte: startDate, $lte: endDate } };
    if (role === "reseller" || role === "lco") userQuery.referredBy = _id;

    const users = await User.find(userQuery).select("_id createdAt").lean();
    if (!users.length) return successResponse(res, "No users found", []);

    const userIds = users.map(u => u._id);

    const today = new Date();
    const next5Days = new Date(today);
    next5Days.setDate(today.getDate() + 5);

    // Find plans about to expire
    const plans = await PurchasedPlan.find({
        userId: { $in: userIds },
        status: "active",
        expiryDate: { $gte: today, $lte: next5Days },
    }).select("userId expiryDate");

    if (!plans.length) return successResponse(res, "No upcoming renewals found", []);

    const aggregated = {};

    plans.forEach(plan => {
        const expiry = new Date(plan.expiryDate);
        const day = expiry.getUTCDate();
        const monthNum = expiry.getUTCMonth() + 1;
        const yearNum = expiry.getUTCFullYear();

        if (filterValue === "day") {
            const key = `${day}-${monthNum}-${yearNum}`;
            if (!aggregated[key])
                aggregated[key] = { _id: { day, month: monthNum, year: yearNum }, totalUsers: 0 };
            aggregated[key].totalUsers += 1;
        } else if (filterValue === "week") {
            const week = day <= 7 ? 1 : day <= 14 ? 2 : day <= 21 ? 3 : day <= 28 ? 4 : 5;
            const key = `${week}-${monthNum}-${yearNum}`;
            if (!aggregated[key])
                aggregated[key] = { _id: { monthWeek: week, month: monthNum, year: yearNum }, totalUsers: 0 };
            aggregated[key].totalUsers += 1;
        } else if (filterValue === "month") {
            const key = `${monthNum}-${yearNum}`;
            if (!aggregated[key])
                aggregated[key] = { _id: { month: monthNum, year: yearNum }, totalUsers: 0 };
            aggregated[key].totalUsers += 1;
        } else {
            return next(new AppError("Invalid filter. Use day/week/month", 400));
        }
    });

    return successResponse(res, `${filterValue}-wise upcoming renewal user count`, Object.values(aggregated));
});
