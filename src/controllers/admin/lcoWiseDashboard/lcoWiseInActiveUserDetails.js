const mongoose = require("mongoose");
const User = require("../../../models/user");
const Lco = require("../../../models/lco");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");

exports.getLcoWiseInActiveUserDetails = catchAsync(async (req, res) => {
    const { lcoId } = req.params;
    const { filter = "day", year, month } = req.query; // day | week | month

    if (!lcoId || !mongoose.Types.ObjectId.isValid(lcoId)) {
        return successResponse(res, "Invalid or missing LCO ID", { result: [] });
    }

    const now = new Date();
    const selectedYear = parseInt(year) || now.getFullYear();
    const selectedMonth = month ? parseInt(month) - 1 : now.getMonth(); // 0-based

    const matchCondition = {
        "generalInformation.createdFor.type": "Lco",
        "generalInformation.createdFor.id": new mongoose.Types.ObjectId(lcoId),
        status: "Inactive"
    };

    let groupStage = {};
    let dateRange = {};
    let format = "";

    // === DAY WISE ===
    if (filter === "day") {
        const startDate = new Date(selectedYear, selectedMonth, 1);
        const endDate = new Date(selectedYear, selectedMonth + 1, 0, 23, 59, 59);
        dateRange = { $gte: startDate, $lte: endDate };

        groupStage = {
            _id: { $dayOfMonth: "$updatedAt" },
            count: { $sum: 1 },
        };
        format = "day";
    }

    // === WEEK WISE ===
    else if (filter === "week") {
        const startDate = new Date(selectedYear, selectedMonth, 1);
        const endDate = new Date(selectedYear, selectedMonth + 1, 0, 23, 59, 59);
        dateRange = { $gte: startDate, $lte: endDate };

        groupStage = {
            _id: { $dayOfMonth: "$updatedAt" },
            count: { $sum: 1 },
        };
        format = "week";
    }

    // === MONTH WISE ===
    else if (filter === "month") {
        const startDate = new Date(selectedYear, 0, 1);
        const endDate = new Date(selectedYear, 11, 31, 23, 59, 59);
        dateRange = { $gte: startDate, $lte: endDate };

        groupStage = {
            _id: { $month: "$updatedAt" },
            count: { $sum: 1 },
        };
        format = "month";
    }

    // === AGGREGATION QUERY ===
    const data = await User.aggregate([
        { $match: { ...matchCondition, updatedAt: dateRange } },
        { $group: groupStage },
        { $sort: { "_id": 1 } },
    ]);

    let result = [];

    // === RESPONSE FORMAT ===
    // --- DAY WISE ---
    if (format === "day") {
        const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
        for (let d = 1; d <= daysInMonth; d++) {
            const dayData = data.find((x) => x._id === d);
            result.push({
                label: `${d} ${new Date(selectedYear, selectedMonth).toLocaleString("default", { month: "long" })}`,
                count: dayData ? dayData.count : 0,
            });
        }
    }

    // --- WEEK WISE ---
    else if (format === "week") {
        const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
        const weeks = [];
        let startDay = 1;

        while (startDay <= daysInMonth) {
            const endDay = Math.min(startDay + 6, daysInMonth);
            const startDate = new Date(selectedYear, selectedMonth, startDay);
            const endDate = new Date(selectedYear, selectedMonth, endDay, 23, 59, 59);

            const weekCount = data
                .filter((d) => {
                    const createdDay = d._id;
                    const createdDate = new Date(selectedYear, selectedMonth, createdDay);
                    return createdDate >= startDate && createdDate <= endDate;
                })
                .reduce((sum, d) => sum + d.count, 0);

            weeks.push({
                label: `Week ${weeks.length + 1} (${startDay}-${endDay} ${startDate.toLocaleString("default", { month: "short" })})`,
                count: weekCount,
            });

            startDay += 7;
        }

        result = weeks;
    }

    // --- MONTH WISE ---
    else if (format === "month") {
        const monthNames = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December",
        ];

        for (let m = 1; m <= 12; m++) {
            const monthData = data.find((x) => x._id === m);
            result.push({
                label: monthNames[m - 1],
                count: monthData ? monthData.count : 0,
            });
        }
    }

    return successResponse(res, "LCO-wise user Inactive trend fetched successfully", {
        lcoId,
        filter,
        year: selectedYear,
        month: selectedMonth + 1,
        result,
    });
});
