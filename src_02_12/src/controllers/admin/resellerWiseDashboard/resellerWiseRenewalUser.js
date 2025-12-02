const mongoose = require("mongoose");
const User = require("../../../models/user");
const Reseller = require("../../../models/retailer");
const PurchasedPlan = require("../../../models/purchasedPlan");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");

exports.getResellerWiseRenewalUsersCount = catchAsync(async (req, res, next) => {
    const now = new Date();

    // === DATE RANGES ===
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

    // === GET ALL RESELLERS ===
    const allResellers = await Reseller.find().select("_id resellerName").lean();

    // === GET ALL ACTIVE + RENEWED PURCHASE PLANS ===
    const purchasedPlans = await PurchasedPlan.aggregate([
        {
            $match: {
                status: "active",
                isRenewed: true,
            },
        },
        {
            $project: {
                userId: 1,
                renewals: 1,
                latestRenewal: { $last: "$renewals" }, // ✅ Get latest renewal object
            },
        },
    ]);

    // === FETCH USERS TO MAP USER -> RESELLER ===
    const users = await User.find({
        "generalInformation.createdFor.type": "Retailer",
    })
        .select("_id generalInformation.createdFor.id")
        .lean();

    const userToReseller = {};
    users.forEach((u) => {
        if (u.generalInformation?.createdFor?.id) {
            userToReseller[u._id.toString()] =
                u.generalInformation.createdFor.id.toString();
        }
    });

    // === INITIALIZE COUNTERS ===
    const resellerData = {};
    allResellers.forEach((res) => {
        resellerData[res._id.toString()] = {
            resellerId: res._id,
            resellerName: res.resellerName,
            totalRenewedUsers: 0,
            todayRenewedUsers: 0,
            weekRenewedUsers: 0,
            monthRenewedUsers: 0,
        };
    });

    // === LOOP THROUGH PURCHASED PLANS AND COUNT RENEWALS ===
    purchasedPlans.forEach((plan) => {
        const userId = plan.userId?.toString();
        const resellerId = userToReseller[userId];
        if (!resellerId) return; // user not mapped to reseller

        const reseller = resellerData[resellerId];
        if (!reseller) return;

        reseller.totalRenewedUsers += 1;

        const renewedOn = plan.latestRenewal?.renewedOn;
        if (!renewedOn) return;

        const renewedDate = new Date(renewedOn);

        // === Check by date range ===
        if (renewedDate >= todayStart && renewedDate <= todayEnd)
            reseller.todayRenewedUsers += 1;

        if (renewedDate >= weekStart && renewedDate <= weekEnd)
            reseller.weekRenewedUsers += 1;

        if (renewedDate >= monthStart && renewedDate <= monthEnd)
            reseller.monthRenewedUsers += 1;
    });

    // === FINAL RESULT ARRAY ===
    const result = Object.values(resellerData);

    return successResponse(res, "Reseller-wise renewal user summary", { result });
});
