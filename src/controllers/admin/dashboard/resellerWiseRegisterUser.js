const mongoose = require("mongoose");
const User = require("../../../models/user");
const Reseller = require("../../../models/retailer");
const catchAsync = require("../../../utils/catchAsync");
const AppError = require("../../../utils/AppError");
const { successResponse } = require("../../../utils/responseHandler");

exports.getResellerWiseRegisterUsersCount = catchAsync(async (req, res, next) => {
    const { filter, year, month, date } = req.query;
    const filterValue = filter || "day";

    const now = new Date();
    const selectedYear = parseInt(year) || now.getFullYear();
    const selectedMonth = month ? parseInt(month) - 1 : now.getMonth(); // 0-based month
    const selectedDate = date ? new Date(date) : now;

    const matchQuery = { "generalInformation.createdFor.type": "Retailer" };

    // === FILTER LOGIC ===
    if (filterValue === "day") {
        const startOfDay = new Date(selectedDate.setHours(0, 0, 0, 0));
        const endOfDay = new Date(selectedDate.setHours(23, 59, 59, 999));
        matchQuery.createdAt = { $gte: startOfDay, $lte: endOfDay };
    } else if (filterValue === "week") {
        const startOfMonth = new Date(selectedYear, selectedMonth, 1);
        const endOfMonth = new Date(selectedYear, selectedMonth + 1, 0, 23, 59, 59);
        matchQuery.createdAt = { $gte: startOfMonth, $lte: endOfMonth };
    } else if (filterValue === "month") {
        const startOfYear = new Date(selectedYear, 0, 1);
        const endOfYear = new Date(selectedYear, 11, 31, 23, 59, 59);
        matchQuery.createdAt = { $gte: startOfYear, $lte: endOfYear };
    } else {
        return next(new AppError("Invalid filter. Use day/week/month", 400));
    }

    // === AGGREGATION ===
    let groupStage = {};
    if (filterValue === "day") {
        groupStage = {
            _id: {
                resellerId: "$generalInformation.createdFor.id",
                day: { $dayOfMonth: "$createdAt" },
                month: { $month: "$createdAt" },
                year: { $year: "$createdAt" },
            },
            totalUsers: { $sum: 1 },
        };
    } else if (filterValue === "week") {
        groupStage = {
            _id: {
                resellerId: "$generalInformation.createdFor.id",
                week: { $isoWeek: "$createdAt" },
                year: { $year: "$createdAt" },
            },
            totalUsers: { $sum: 1 },
            firstDate: { $min: "$createdAt" },
            lastDate: { $max: "$createdAt" },
        };
    } else if (filterValue === "month") {
        groupStage = {
            _id: {
                resellerId: "$generalInformation.createdFor.id",
                month: { $month: "$createdAt" },
                year: { $year: "$createdAt" },
            },
            totalUsers: { $sum: 1 },
        };
    }

    const users = await User.aggregate([
        { $match: matchQuery },
        { $group: groupStage },
        { $sort: { "_id.year": 1, "_id.month": 1, "_id.week": 1 } },
    ]);

    // === FETCH ALL RESELLERS ===
    const allResellers = await Reseller.find().select("_id resellerName").lean();

    // === BUILD USER MAP (resellerId -> [monthData]) ===
    const userMap = {};
    users.forEach((u) => {
        const resellerId = u._id.resellerId?.toString();
        if (!userMap[resellerId]) userMap[resellerId] = [];
        userMap[resellerId].push(u);
    });

    // === FORMAT FINAL RESPONSE ===
    const result = allResellers.map((reseller) => {
        const resellerId = reseller._id.toString();
        const userDataList = userMap[resellerId] || [];

        if (filterValue === "month") {
            // Generate 12-month array even if data missing
            const monthlyData = Array.from({ length: 12 }, (_, i) => {
                const existingMonth = userDataList.find(
                    (u) => u._id.month === i + 1 && u._id.year === selectedYear
                );
                const monthName = new Date(selectedYear, i).toLocaleString("default", {
                    month: "long",
                });
                return {
                    month: monthName,
                    year: selectedYear,
                    totalUsers: existingMonth ? existingMonth.totalUsers : 0,
                };
            });

            return {
                resellerId,
                resellerName: reseller.resellerName,
                totalUsersByMonth: monthlyData,
            };
        }

        // ==== DAILY / WEEKLY SAME LOGIC ====
        if (filterValue === "day") {
            const u = userDataList[0];
            return {
                resellerId,
                resellerName: reseller.resellerName,
                date: u
                    ? `${u._id.day}-${u._id.month}-${u._id.year}`
                    : `${selectedDate.getDate()}-${selectedDate.getMonth() + 1}-${selectedDate.getFullYear()}`,
                totalUsers: u ? u.totalUsers : 0,
            };
        } else if (filterValue === "week") {
            const u = userDataList[0];
            const weekRange = u
                ? `${u.firstDate.toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                })} - ${u.lastDate.toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                })}`
                : "No Data";

            return {
                resellerId,
                resellerName: reseller.resellerName,
                year: selectedYear,
                week: u ? u._id.week : "-",
                weekRange,
                totalUsers: u ? u.totalUsers : 0,
            };
        }
    });

    return successResponse(
        res,
        `Reseller-wise registered user count (${filterValue}-wise)`,
        result
    );
});


