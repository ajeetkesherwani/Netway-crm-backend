const mongoose = require("mongoose");
const User = require("../../../models/user");
const Reseller = require("../../../models/retailer");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");

exports.getResellerWiseActiveUsersCount = catchAsync(async (req, res, next) => {
    const now = new Date();

    // === DEFINE DATE RANGES ===
    const todayStart = new Date(now.setHours(0, 0, 0, 0));
    const todayEnd = new Date(now.setHours(23, 59, 59, 999));

    const weekCurr = new Date();
    const first = weekCurr.getDate() - weekCurr.getDay() + 1; // Monday
    const last = first + 6; // Sunday
    const weekStart = new Date(weekCurr.setDate(first));
    weekStart.setHours(0, 0, 0, 0);
    const weekEnd = new Date(weekCurr.setDate(last));
    weekEnd.setHours(23, 59, 59, 999);

    const year = new Date().getFullYear();
    const month = new Date().getMonth();
    const monthStart = new Date(year, month, 1);
    const monthEnd = new Date(year, month + 1, 0, 23, 59, 59);

    // === FETCH ALL RESELLERS ===
    const allResellers = await Reseller.find().select("_id resellerName").lean();

    // === COMMON MATCH CONDITION FOR ACTIVE USERS ===
    const activeMatch = {
        "generalInformation.createdFor.type": "Retailer",
        status: "active",
    };

    // === FETCH ACTIVE USERS GROUPED BY RESELLER (TOTAL) ===
    const totalUsers = await User.aggregate([
        { $match: activeMatch },
        { $group: { _id: "$generalInformation.createdFor.id", count: { $sum: 1 } } },
    ]);

    // === TODAY ACTIVE USERS ===
    const todayUsers = await User.aggregate([
        {
            $match: {
                ...activeMatch,
                createdAt: { $gte: todayStart, $lte: todayEnd },
            },
        },
        { $group: { _id: "$generalInformation.createdFor.id", count: { $sum: 1 } } },
    ]);

    // === WEEK ACTIVE USERS ===
    const weekUsers = await User.aggregate([
        {
            $match: {
                ...activeMatch,
                createdAt: { $gte: weekStart, $lte: weekEnd },
            },
        },
        { $group: { _id: "$generalInformation.createdFor.id", count: { $sum: 1 } } },
    ]);

    // === MONTH ACTIVE USERS ===
    const monthUsers = await User.aggregate([
        {
            $match: {
                ...activeMatch,
                createdAt: { $gte: monthStart, $lte: monthEnd },
            },
        },
        { $group: { _id: "$generalInformation.createdFor.id", count: { $sum: 1 } } },
    ]);

    // === COMBINE ALL COUNTS FOR EACH RESELLER ===
    const result = allResellers.map((reseller) => {
        const id = reseller._id.toString();

        const total = totalUsers.find((u) => u._id?.toString() === id);
        const today = todayUsers.find((u) => u._id?.toString() === id);
        const week = weekUsers.find((u) => u._id?.toString() === id);
        const monthC = monthUsers.find((u) => u._id?.toString() === id);

        return {
            resellerId: reseller._id,
            resellerName: reseller.resellerName,
            totalActiveUsers: total ? total.count : 0,
            todayActiveUsers: today ? today.count : 0,
            weekActiveUsers: week ? week.count : 0,
            monthActiveUsers: monthC ? monthC.count : 0,
        };
    });

    return successResponse(res, "Reseller-wise active user summary", { result });
});
