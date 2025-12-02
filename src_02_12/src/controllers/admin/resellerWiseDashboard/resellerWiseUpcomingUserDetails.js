const mongoose = require("mongoose");
const User = require("../../../models/user");
const PurchasedPlan = require("../../../models/purchasedPlan");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");

exports.getResellerWiseUpcomingRenewalUserDetails = catchAsync(async (req, res) => {
    const { resellerId } = req.params;
    const { filter = "day", year, month } = req.query; // day | week | month

    if (!resellerId || !mongoose.Types.ObjectId.isValid(resellerId)) {
        return successResponse(res, "Invalid or missing reseller ID", { result: [] });
    }

    const now = new Date();
    const todayStart = new Date(now.setHours(0, 0, 0, 0));
    const selectedYear = parseInt(year) || now.getFullYear();
    const selectedMonth = month ? parseInt(month) - 1 : now.getMonth(); // 0-based

    // === FIND USERS UNDER RESELLER ===
    const users = await User.find({
        "generalInformation.createdFor.type": "Retailer",
        "generalInformation.createdFor.id": new mongoose.Types.ObjectId(resellerId),
    }).select("_id").lean();

    if (!users.length) {
        return successResponse(res, "No users found for this reseller", { result: [] });
    }

    const userIds = users.map((u) => u._id);

    // === FETCH PURCHASED PLANS ===
    const plans = await PurchasedPlan.find({
        userId: { $in: userIds },
        status: "active",
    }).select("userId isRenewed expiryDate renewals").lean();

    // === DETERMINE VALID EXPIRY DATES ===
    const validPlans = [];

    plans.forEach((plan) => {
        let expiryDate;

        if (plan.isRenewed && Array.isArray(plan.renewals) && plan.renewals.length > 0) {
            const latestRenewal = plan.renewals[plan.renewals.length - 1];
            expiryDate = latestRenewal?.newExpiryDate
                ? new Date(latestRenewal.newExpiryDate)
                : new Date(plan.expiryDate);
        } else {
            expiryDate = new Date(plan.expiryDate);
        }

        // Remove time
        expiryDate.setHours(0, 0, 0, 0);

        // Include if expiryDate is today or in future
        if (expiryDate >= todayStart) {
            validPlans.push({ userId: plan.userId, expiryDate });
        }
    });

    if (!validPlans.length) {
        return successResponse(res, "No upcoming renewals found", {
            resellerId,
            filter,
            result: [],
        });
    }

    // === GROUP BY FILTER ===
    let result = [];

    // ---- DAY WISE ----
    if (filter === "day") {
        const startDate = new Date(selectedYear, selectedMonth, 1);
        const endDate = new Date(selectedYear, selectedMonth + 1, 0, 23, 59, 59);
        const dayCounts = {};

        validPlans.forEach((plan) => {
            const d = new Date(plan.expiryDate);
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

    // ---- WEEK WISE ----
    else if (filter === "week") {
        const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
        let startDay = 1;
        let weekIndex = 1;
        const weeks = [];

        while (startDay <= daysInMonth) {
            const endDay = Math.min(startDay + 6, daysInMonth);
            const weekStart = new Date(selectedYear, selectedMonth, startDay);
            const weekEnd = new Date(selectedYear, selectedMonth, endDay, 23, 59, 59);

            const count = validPlans.filter((plan) => {
                const d = new Date(plan.expiryDate);
                return d >= weekStart && d <= weekEnd;
            }).length;

            weeks.push({
                label: `Week ${weekIndex} (${startDay}-${endDay} ${weekStart.toLocaleString("default", { month: "short" })})`,
                count,
            });

            startDay += 7;
            weekIndex++;
        }

        result = weeks;
    }

    // ---- MONTH WISE ----
    else if (filter === "month") {
        const startDate = new Date(selectedYear, 0, 1);
        const endDate = new Date(selectedYear, 11, 31, 23, 59, 59);
        const monthCounts = {};

        validPlans.forEach((plan) => {
            const d = new Date(plan.expiryDate);
            if (d >= startDate && d <= endDate) {
                const m = d.getMonth() + 1;
                monthCounts[m] = (monthCounts[m] || 0) + 1;
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

    // === RESPONSE ===
    return successResponse(res, "Upcoming renewal users fetched successfully", {
        resellerId,
        filter,
        year: selectedYear,
        month: selectedMonth + 1,
        totalUsers: validPlans.length,
        result,
    });
});
