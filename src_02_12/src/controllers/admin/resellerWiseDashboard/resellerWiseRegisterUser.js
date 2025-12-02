const mongoose = require("mongoose");
const User = require("../../../models/user");
const Reseller = require("../../../models/retailer");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");

exports.getResellerWiseRegisterUsersCount = catchAsync(async (req, res, next) => {
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

    // === FETCH USERS GROUPED BY RESELLER (ALL USERS) ===
    const totalUsers = await User.aggregate([
        { $match: { "generalInformation.createdFor.type": "Retailer" } },
        { $group: { _id: "$generalInformation.createdFor.id", count: { $sum: 1 } } },
    ]);

    // === FETCH TODAY USERS ===
    const todayUsers = await User.aggregate([
        {
            $match: {
                "generalInformation.createdFor.type": "Retailer",
                createdAt: { $gte: todayStart, $lte: todayEnd },
            },
        },
        { $group: { _id: "$generalInformation.createdFor.id", count: { $sum: 1 } } },
    ]);

    // === FETCH WEEK USERS ===
    const weekUsers = await User.aggregate([
        {
            $match: {
                "generalInformation.createdFor.type": "Retailer",
                createdAt: { $gte: weekStart, $lte: weekEnd },
            },
        },
        { $group: { _id: "$generalInformation.createdFor.id", count: { $sum: 1 } } },
    ]);

    // === FETCH MONTH USERS ===
    const monthUsers = await User.aggregate([
        {
            $match: {
                "generalInformation.createdFor.type": "Retailer",
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
            totalUsers: total ? total.count : 0,
            todayUsers: today ? today.count : 0,
            weekUsers: week ? week.count : 0,
            monthUsers: monthC ? monthC.count : 0,
        };
    });

    return successResponse(res, "Reseller-wise user registration summary", {
        result,
    });
});
