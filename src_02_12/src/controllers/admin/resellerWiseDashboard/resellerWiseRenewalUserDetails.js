const mongoose = require("mongoose");
const User = require("../../../models/user");
const Reseller = require("../../../models/retailer");
const PurchasedPlan = require("../../../models/purchasedPlan");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");

exports.getResellerWiseRenewalUserDetails = catchAsync(async (req, res) => {
    const { resellerId } = req.params;
    const { filter = "day", year, month } = req.query; // day | week | month

    if (!resellerId || !mongoose.Types.ObjectId.isValid(resellerId)) {
        return successResponse(res, "Invalid or missing reseller ID", { result: [] });
    }

    const now = new Date();
    const selectedYear = parseInt(year) || now.getFullYear();
    const selectedMonth = month ? parseInt(month) - 1 : now.getMonth(); // 0-based month

    // === MATCH USERS THAT BELONG TO THIS RESELLER ===
    const users = await User.find({
        "generalInformation.createdFor.type": "Retailer",
        "generalInformation.createdFor.id": new mongoose.Types.ObjectId(resellerId),
    }).select("_id").lean();

    const userIds = users.map((u) => u._id);

    if (userIds.length === 0) {
        return successResponse(res, "No users found for this reseller", { result: [] });
    }

    // === GET ALL ACTIVE + RENEWED PURCHASE PLANS FOR THESE USERS ===
    const purchasedPlans = await PurchasedPlan.aggregate([
        {
            $match: {
                status: "active",
                isRenewed: true,
                userId: { $in: userIds },
            },
        },
        {
            $project: {
                userId: 1,
                renewals: 1,
                latestRenewal: { $last: "$renewals" },
            },
        },
        {
            $addFields: {
                renewedOn: "$latestRenewal.renewedOn",
            },
        },
        {
            $match: { renewedOn: { $ne: null } },
        },
    ]);

    let result = [];
    let format = "";
    let dateRange = {};

    // === DAY WISE ===
    if (filter === "day") {
        const startDate = new Date(selectedYear, selectedMonth, 1);
        const endDate = new Date(selectedYear, selectedMonth + 1, 0, 23, 59, 59);
        dateRange = { $gte: startDate, $lte: endDate };
        format = "day";

        const dayCounts = {};
        purchasedPlans.forEach((plan) => {
            const d = new Date(plan.renewedOn);
            if (d >= startDate && d <= endDate) {
                const day = d.getDate();
                dayCounts[day] = (dayCounts[day] || 0) + 1;
            }
        });

        const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
        for (let d = 1; d <= daysInMonth; d++) {
            result.push({
                label: `${d} ${new Date(selectedYear, selectedMonth).toLocaleString("default", { month: "long" })}`,
                count: dayCounts[d] || 0,
            });
        }
    }

    // === WEEK WISE ===
    else if (filter === "week") {
        const startDate = new Date(selectedYear, selectedMonth, 1);
        const endDate = new Date(selectedYear, selectedMonth + 1, 0, 23, 59, 59);
        dateRange = { $gte: startDate, $lte: endDate };
        format = "week";

        const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
        const weeks = [];
        let startDay = 1;

        while (startDay <= daysInMonth) {
            const endDay = Math.min(startDay + 6, daysInMonth);
            const weekStart = new Date(selectedYear, selectedMonth, startDay);
            const weekEnd = new Date(selectedYear, selectedMonth, endDay, 23, 59, 59);

            const count = purchasedPlans.filter((plan) => {
                const d = new Date(plan.renewedOn);
                return d >= weekStart && d <= weekEnd;
            }).length;

            weeks.push({
                label: `Week ${weeks.length + 1} (${startDay}-${endDay} ${weekStart.toLocaleString("default", { month: "short" })})`,
                count,
            });

            startDay += 7;
        }

        result = weeks;
    }

    // === MONTH WISE ===
    else if (filter === "month") {
        const startDate = new Date(selectedYear, 0, 1);
        const endDate = new Date(selectedYear, 11, 31, 23, 59, 59);
        dateRange = { $gte: startDate, $lte: endDate };
        format = "month";

        const monthCounts = {};
        purchasedPlans.forEach((plan) => {
            const d = new Date(plan.renewedOn);
            if (d >= startDate && d <= endDate) {
                const monthIndex = d.getMonth() + 1;
                monthCounts[monthIndex] = (monthCounts[monthIndex] || 0) + 1;
            }
        });

        const monthNames = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December",
        ];

        for (let m = 1; m <= 12; m++) {
            result.push({
                label: monthNames[m - 1],
                count: monthCounts[m] || 0,
            });
        }
    }

    return successResponse(res, "Reseller-wise renewal trend fetched successfully", {
        resellerId,
        filter,
        year: selectedYear,
        month: selectedMonth + 1,
        result,
    });
});
