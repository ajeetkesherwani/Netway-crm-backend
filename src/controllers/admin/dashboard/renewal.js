// const User = require("../../../models/user");
// const PurchasedPlan = require("../../../models/purchasedPlan");
// const catchAsync = require("../../../utils/catchAsync");
// const AppError = require("../../../utils/AppError");
// const { successResponse } = require("../../../utils/responseHandler");

// exports.getRenewedUsersCountByFilter = catchAsync(async (req, res, next) => {
//     const { filter, month, year } = req.query;
//     const { role, _id } = req.user;

//     const filterValue = filter || "day";
//     const currentDate = new Date();
//     const targetYear = year || currentDate.getFullYear();

//     let targetEndMonth;
//     if (month) {
//         targetEndMonth = parseInt(month);
//     } else {
//         targetEndMonth = parseInt(targetYear) === currentDate.getFullYear() ? currentDate.getMonth() + 1 : 12;
//     }

//     const startDate = new Date(targetYear, 0, 1);
//     const endDate = new Date(targetYear, targetEndMonth, 0, 23, 59, 59);

//     // Active users filter
//     let matchUserQuery = { status: "active", createdAt: { $gte: startDate, $lte: endDate } };
//     if (role === "reseller" || role === "lco") matchUserQuery.referredBy = _id;

//     const activeUsers = await User.find(matchUserQuery).select("_id createdAt").lean();
//     const userIds = activeUsers.map(u => u._id);

//     // Find renewed plans
//     const renewedPlans = await PurchasedPlan.find({
//         userId: { $in: userIds },
//         isRenewed: true
//     }).select("userId").lean();

//     const renewedUserIds = renewedPlans.map(p => p.userId.toString());
//     const renewedUsers = activeUsers.filter(u => renewedUserIds.includes(u._id.toString()));

//     // Aggregate counts only
//     let aggregated = {};
//     if (filterValue === "day") {
//         aggregated = renewedUsers.reduce((acc, user) => {
//             const date = new Date(user.createdAt);
//             const day = date.getUTCDate();
//             const monthNum = date.getUTCMonth() + 1;
//             const yearNum = date.getUTCFullYear();
//             const key = `${day}-${monthNum}-${yearNum}`;
//             if (!acc[key]) acc[key] = { _id: { day, month: monthNum, year: yearNum }, totalUsers: 0 };
//             acc[key].totalUsers += 1;
//             return acc;
//         }, {});
//     } else if (filterValue === "week") {
//         aggregated = renewedUsers.reduce((acc, user) => {
//             const date = new Date(user.createdAt);
//             const dayOfMonth = date.getUTCDate();
//             const monthNum = date.getUTCMonth() + 1;
//             const yearNum = date.getUTCFullYear();
//             const monthWeek = dayOfMonth <= 7 ? 1 : dayOfMonth <= 14 ? 2 : dayOfMonth <= 21 ? 3 : dayOfMonth <= 28 ? 4 : 5;
//             const key = `${monthWeek}-${monthNum}-${yearNum}`;
//             if (!acc[key]) acc[key] = { _id: { monthWeek, month: monthNum, year: yearNum }, totalUsers: 0 };
//             acc[key].totalUsers += 1;
//             return acc;
//         }, {});
//     } else if (filterValue === "month") {
//         aggregated = renewedUsers.reduce((acc, user) => {
//             const date = new Date(user.createdAt);
//             const monthNum = date.getUTCMonth() + 1;
//             const yearNum = date.getUTCFullYear();
//             const key = `${monthNum}-${yearNum}`;
//             if (!acc[key]) acc[key] = { _id: { month: monthNum, year: yearNum }, totalUsers: 0 };
//             acc[key].totalUsers += 1;
//             return acc;
//         }, {});
//     } else {
//         return next(new AppError("Invalid filter. Use day/week/month", 400));
//     }

//     return successResponse(res, `${filterValue}-wise renewed user counts`, Object.values(aggregated));
// });

const mongoose = require("mongoose");
const PurchasedPlan = require("../../../models/purchasedPlan");
const User = require("../../../models/user");
const Reseller = require("../../../models/retailer");
const Lco = require("../../../models/lco");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");

exports.getRenewedUsersCountByFilter = catchAsync(async (req, res) => {
    const { role, _id: requesterId } = req.user;

    // Handle timezones properly (IST based filtering) ---
    const now = new Date();
    const IST_OFFSET = 5.5 * 60 * 60 * 1000;
    const nowIST = new Date(now.getTime() + IST_OFFSET);

    const startOfDayIST = new Date(nowIST.getFullYear(), nowIST.getMonth(), nowIST.getDate());
    const startOfWeekIST = new Date(startOfDayIST);
    startOfWeekIST.setDate(nowIST.getDate() - nowIST.getDay());
    const startOfMonthIST = new Date(nowIST.getFullYear(), nowIST.getMonth(), 1);

    // Convert back to UTC to compare with DB UTC times
    const startOfDayUTC = new Date(startOfDayIST.getTime() - IST_OFFSET);
    const startOfWeekUTC = new Date(startOfWeekIST.getTime() - IST_OFFSET);
    const startOfMonthUTC = new Date(startOfMonthIST.getTime() - IST_OFFSET);

    // Find all renewed purchased plans ---
    const purchasedPlans = await PurchasedPlan.find({ isRenewed: true })
        .select("userId renewals")
        .lean();

    if (!purchasedPlans.length) {
        return successResponse(res, "No renewal data found", {
            role,
            totalRenewalUsers: 0,
            todayRenewals: 0,
            weekRenewals: 0,
            monthRenewals: 0,
        });
    }

    //  Build user -> latest renewed date map ---
    const userRenewalMap = new Map();
    for (const plan of purchasedPlans) {
        const userId = plan.userId?.toString?.();
        if (!userId) continue;

        if (!Array.isArray(plan.renewals) || plan.renewals.length === 0) continue;

        const lastRenewal = plan.renewals[plan.renewals.length - 1];
        const renewedOn = lastRenewal?.renewedOn ? new Date(lastRenewal.renewedOn) : null;
        if (!renewedOn) continue;

        const existing = userRenewalMap.get(userId);
        if (!existing || renewedOn > existing) userRenewalMap.set(userId, renewedOn);
    }

    if (!userRenewalMap.size) {
        return successResponse(res, "No valid renewal records found", {
            role,
            totalRenewalUsers: 0,
            todayRenewals: 0,
            weekRenewals: 0,
            monthRenewals: 0,
        });
    }

    // Fetch users for those userIds ---
    const userIds = Array.from(userRenewalMap.keys()).map((id) => new mongoose.Types.ObjectId(id));
    const users = await User.find({ _id: { $in: userIds } })
        .select("_id generalInformation.createdFor")
        .lean();

    // --- Role-based filtering logic ---
    let totalRenewalUsers = 0;
    let todayRenewals = 0;
    let weekRenewals = 0;
    let monthRenewals = 0;

    for (const user of users) {
        const { _id, generalInformation } = user;
        const createdFor = generalInformation?.createdFor;

        if (!createdFor?.type || !createdFor?.id) continue;

        // Filter by role
        if (role === "Reseller") {
            if (
                createdFor.type.toLowerCase() !== "retailer" ||
                createdFor.id.toString() !== requesterId.toString()
            )
                continue;
        } else if (role === "Lco") {
            if (
                createdFor.type.toLowerCase() !== "lco" ||
                createdFor.id.toString() !== requesterId.toString()
            )
                continue;
        }

        // If Admin → no restriction

        const latestRenewedOn = userRenewalMap.get(_id.toString());
        if (!latestRenewedOn) continue;

        totalRenewalUsers++;
        if (latestRenewedOn >= startOfDayUTC) todayRenewals++;
        if (latestRenewedOn >= startOfWeekUTC) weekRenewals++;
        if (latestRenewedOn >= startOfMonthUTC) monthRenewals++;
    }

    //  Optional name fetch ---
    let name = null;
    if (role === "Reseller") {
        const r = await Reseller.findById(requesterId).select("resellerName").lean();
        name = r?.resellerName || null;
    } else if (role === "Lco") {
        const l = await Lco.findById(requesterId).select("lcoName").lean();
        name = l?.lcoName || null;
    }

    // Final Response ---
    return successResponse(res, "Renewal user count fetched successfully", {
        role,
        name,
        totalRenewalUsers,
        todayRenewals,
        weekRenewals,
        monthRenewals,
    });
});
