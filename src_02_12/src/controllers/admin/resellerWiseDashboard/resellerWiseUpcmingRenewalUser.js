const mongoose = require("mongoose");
const User = require("../../../models/user");
const Reseller = require("../../../models/retailer");
const PurchasedPlan = require("../../../models/purchasedPlan");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");

exports.getResellerWiseUpcomingRenewalUsersCount = catchAsync(async (req, res, next) => {

    const now = new Date();

    // === DATE RANGES ===
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(now);
    todayEnd.setHours(23, 59, 59, 999);

    // Week range (Monday to Sunday)
    const currentDay = now.getDay(); // Sunday=0
    const diffToMonday = currentDay === 0 ? -6 : 1 - currentDay;
    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() + diffToMonday);
    weekStart.setHours(0, 0, 0, 0);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    // Month range
    const year = now.getFullYear();
    const month = now.getMonth();
    const monthStart = new Date(year, month, 1);
    const monthEnd = new Date(year, month + 1, 0, 23, 59, 59);

    // === FETCH ALL RESELLERS ===
    const allResellers = await Reseller.find().select("_id resellerName").lean();

    if (!allResellers.length)
        return successResponse(res, "No resellers found", { result: [] });

    // === FETCH ALL USERS CREATED FOR RETAILERS (Reseller-wise mapping) ===
    const users = await User.find({
        "generalInformation.createdFor.type": "Retailer",
    })
        .select("_id generalInformation.createdFor.id")
        .lean();

    const userToReseller = {};
    users.forEach((u) => {
        const resellerId = u.generalInformation?.createdFor?.id?.toString();
        if (resellerId) {
            userToReseller[u._id.toString()] = resellerId;
        }
    });

    // === FETCH ALL ACTIVE PURCHASED PLANS ===
    const purchasedPlans = await PurchasedPlan.find({
        userId: { $in: users.map((u) => u._id) },
        status: "active",
    })
        .select("userId isRenewed expiryDate renewals")
        .lean();

    // === INITIALIZE RESULT DATA ===
    const resellerData = {};
    allResellers.forEach((res) => {
        resellerData[res._id.toString()] = {
            resellerId: res._id,
            resellerName: res.resellerName,
            totalUpcomingRenewals: 0,
            todayExpiringUsers: 0,
            weekExpiringUsers: 0,
            monthExpiringUsers: 0,
        };
    });

    // === PROCESS PURCHASED PLANS ===
    purchasedPlans.forEach((plan) => {
        const userId = plan.userId?.toString();
        const resellerId = userToReseller[userId];
        if (!resellerId || !resellerData[resellerId]) return;

        const reseller = resellerData[resellerId];

        // ✅ Determine expiry date
        let expiryDate;
        if (plan.isRenewed && plan.renewals?.length > 0) {
            const latestRenewal = plan.renewals[plan.renewals.length - 1];
            expiryDate = latestRenewal?.newExpiryDate
                ? new Date(latestRenewal.newExpiryDate)
                : new Date(plan.expiryDate);
        } else {
            expiryDate = new Date(plan.expiryDate);
        }

        // ✅ Skip invalid or past expiry dates
        if (!expiryDate || isNaN(expiryDate.getTime())) return;
        if (expiryDate < todayStart) return;

        // ✅ Count valid upcoming renewals
        reseller.totalUpcomingRenewals += 1;

        if (expiryDate >= todayStart && expiryDate <= todayEnd)
            reseller.todayExpiringUsers += 1;

        if (expiryDate >= weekStart && expiryDate <= weekEnd)
            reseller.weekExpiringUsers += 1;

        if (expiryDate >= monthStart && expiryDate <= monthEnd)
            reseller.monthExpiringUsers += 1;
    });

    const result = Object.values(resellerData);

    return successResponse(res, "Reseller-wise upcoming renewal user summary", { result });
});
