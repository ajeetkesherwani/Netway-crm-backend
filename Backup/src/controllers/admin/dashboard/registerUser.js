const User = require("../../../models/user");
const catchAsync = require("../../../utils/catchAsync");
const AppError = require("../../../utils/AppError");
const { successResponse } = require("../../../utils/responseHandler");
const { monthNames } = require("../../../utils/monthNames");

exports.getRegisterUsersCountByFilter = catchAsync(async (req, res, next) => {
    const { filter, month, year } = req.query;
    const { role, _id } = req.user;

    const filterValue = filter || "day";
    const currentDate = new Date();
    const targetYear = year || currentDate.getFullYear();

    // Determine targetEndMonth
    let targetEndMonth;
    if (month) {
        targetEndMonth = parseInt(month); // specific month
    } else {
        targetEndMonth = parseInt(targetYear) === currentDate.getFullYear() ? currentDate.getMonth() + 1 : 12;
    }

    const startDate = new Date(targetYear, 0, 1);
    const endDate = new Date(targetYear, targetEndMonth, 0, 23, 59, 59);

    let matchQuery = { createdAt: { $gte: startDate, $lte: endDate } };
    if (role === "reseller" || role === "lco") matchQuery.referredBy = _id;

    // Fetch only createdAt for count
    const users = await User.find(matchQuery).select("createdAt").lean();

    let aggregated = {};
    if (filterValue === "day") {
        aggregated = users.reduce((acc, user) => {
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
        aggregated = users.reduce((acc, user) => {
            const date = new Date(user.createdAt);
            const dayOfMonth = date.getUTCDate();
            const monthNum = date.getUTCMonth() + 1;
            const yearNum = date.getUTCFullYear();

            let monthWeek = dayOfMonth <= 7 ? 1 : dayOfMonth <= 14 ? 2 : dayOfMonth <= 21 ? 3 : dayOfMonth <= 28 ? 4 : 5;
            const key = `${monthWeek}-${monthNum}-${yearNum}`;
            if (!acc[key]) acc[key] = { _id: { monthWeek, month: monthNum, year: yearNum }, totalUsers: 0 };
            acc[key].totalUsers += 1;
            return acc;
        }, {});
    } else if (filterValue === "month") {
        aggregated = users.reduce((acc, user) => {
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

    return successResponse(res, `${filterValue}-wise user counts`, Object.values(aggregated));

});
