const mongoose = require("mongoose");
const User = require("../../../models/user");
const Reseller = require("../../../models/retailer");
const Lco = require("../../../models/lco");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");

exports.getInactiveUsersDetailByFilter = catchAsync(async (req, res) => {
    const { role, _id } = req.user; // from logged-in user
    const { filter = "day", year, month } = req.query; // day | week | month

    const now = new Date();
    const selectedYear = parseInt(year) || now.getFullYear();
    const selectedMonth = month ? parseInt(month) - 1 : now.getMonth(); // 0-based month index

    // Base match condition (inactive users only)
    const matchCondition = { status: "Inactive" };

    let name = null;

    // === ROLE-BASED FILTERS ===
    if (role === "Reseller") {
        matchCondition["generalInformation.createdFor.type"] = "Retailer";
        matchCondition["generalInformation.createdFor.id"] = new mongoose.Types.ObjectId(_id);
        const reseller = await Reseller.findById(_id).select("resellerName").lean();
        name = reseller?.resellerName || "Unknown Reseller";
    } else if (role === "Lco") {
        matchCondition["generalInformation.createdFor.type"] = "Lco";
        matchCondition["generalInformation.createdFor.id"] = new mongoose.Types.ObjectId(_id);
        const lco = await Lco.findById(_id).select("lcoName").lean();
        name = lco?.lcoName || "Unknown LCO";
    } else if (role === "Admin") {
        name = "Admin Dashboard";
    }

    // === DATE RANGE ===
    let startDate, endDate, groupStage, format;
    if (filter === "day") {
        startDate = new Date(selectedYear, selectedMonth, 1);
        endDate = new Date(selectedYear, selectedMonth + 1, 0, 23, 59, 59);
        groupStage = { _id: { $dayOfMonth: "$updatedAt" }, count: { $sum: 1 } };
        format = "day";
    } else if (filter === "week") {
        startDate = new Date(selectedYear, selectedMonth, 1);
        endDate = new Date(selectedYear, selectedMonth + 1, 0, 23, 59, 59);
        groupStage = { _id: { $dayOfMonth: "$updatedAt" }, count: { $sum: 1 } };
        format = "week";
    } else if (filter === "month") {
        startDate = new Date(selectedYear, 0, 1);
        endDate = new Date(selectedYear, 11, 31, 23, 59, 59);
        groupStage = { _id: { $month: "$updatedAt" }, count: { $sum: 1 } };
        format = "month";
    }

    // === AGGREGATION ===
    const data = await User.aggregate([
        { $match: { ...matchCondition, updatedAt: { $gte: startDate, $lte: endDate } } },
        { $group: groupStage },
        { $sort: { "_id": 1 } },
    ]);

    let result = [];

    // === RESULT FORMAT ===
    if (format === "day") {
        const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
        for (let d = 1; d <= daysInMonth; d++) {
            const found = data.find((x) => x._id === d);
            result.push({
                label: `${d} ${new Date(selectedYear, selectedMonth).toLocaleString("default", { month: "short" })}`,
                count: found ? found.count : 0,
            });
        }
    } else if (format === "week") {
        const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
        let weekNumber = 1;

        for (let i = 1; i <= daysInMonth; i += 7) {
            const endDay = Math.min(i + 6, daysInMonth);
            const weekCount = data
                .filter((x) => x._id >= i && x._id <= endDay)
                .reduce((sum, x) => sum + x.count, 0);

            result.push({
                label: `Week ${weekNumber} (${i}-${endDay} ${new Date(selectedYear, selectedMonth).toLocaleString("default", { month: "short" })})`,
                count: weekCount,
            });

            weekNumber++;
        }
    } else if (format === "month") {
        const monthNames = [
            "Jan", "Feb", "Mar", "Apr", "May", "Jun",
            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
        ];
        for (let m = 1; m <= 12; m++) {
            const found = data.find((x) => x._id === m);
            result.push({
                label: monthNames[m - 1],
                count: found ? found.count : 0,
            });
        }
    }

    // === RESPONSE ===
    return successResponse(res, "Inactive user count fetched successfully", {
        role,
        name,
        filter,
        year: selectedYear,
        month: selectedMonth + 1,
        totalInactiveUsers: data.reduce((sum, d) => sum + d.count, 0),
        result,
    });
});
