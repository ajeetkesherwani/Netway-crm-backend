const mongoose = require("mongoose");
const User = require("../../../models/user");
const Lco = require("../../../models/lco");
const PurchasedPlan = require("../../../models/purchasedPlan");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");

exports.getLcoWiseRenewedUserCountByReseller = catchAsync(async (req, res) => {
    const { resellerId } = req.params;

    if (!resellerId || !mongoose.Types.ObjectId.isValid(resellerId)) {
        return successResponse(res, "Invalid or missing reseller ID", { result: [] });
    }

    const now = new Date();

    // === Date Ranges ===
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const currentDay = new Date().getDay();
    const diffToMonday = currentDay === 0 ? -6 : 1 - currentDay;
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() + diffToMonday);
    weekStart.setHours(0, 0, 0, 0);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const monthEnd = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0, 23, 59, 59);

    // === Step 1: Find all LCOs under this reseller ===
    const lcos = await Lco.find({ retailerId: resellerId }).select("_id lcoName").lean();

    if (!lcos.length) {
        return successResponse(res, "No LCOs found for this reseller", { result: [] });
    }

    const lcoIds = lcos.map((l) => l._id);

    // === Step 2: Find all Users for these LCOs ===
    const users = await User.find({
        "generalInformation.createdFor.type": "Lco",
        "generalInformation.createdFor.id": { $in: lcoIds },
    })
        .select("_id generalInformation.createdFor.id")
        .lean();

    if (!users.length) {
        return successResponse(res, "No users found for these LCOs", { result: [] });
    }

    const userIdToLcoMap = {};
    users.forEach((u) => {
        const lcoId = u.generalInformation?.createdFor?.id?.toString();
        if (lcoId) userIdToLcoMap[u._id.toString()] = lcoId;
    });

    const userIds = Object.keys(userIdToLcoMap);

    // === Step 3: Find latest renewal per user ===
    const renewedPurchases = await PurchasedPlan.find({
        userId: { $in: userIds },
        isRenewed: true,
    })
        .select("userId renewals")
        .lean();

    // Store latest renewal date per user
    const userLatestRenewal = {};

    renewedPurchases.forEach((plan) => {
        const userId = plan.userId.toString();
        const renewals = plan.renewals || [];
        if (renewals.length === 0) return;

        // Find latest renewal date in this plan
        const latestRenewalInPlan = renewals.reduce((a, b) =>
            new Date(a.renewedOn) > new Date(b.renewedOn) ? a : b
        );

        const latestRenewedOn = new Date(latestRenewalInPlan.renewedOn);

        // Compare with already stored renewal (cross-plan check)
        if (
            !userLatestRenewal[userId] ||
            latestRenewedOn > userLatestRenewal[userId]
        ) {
            userLatestRenewal[userId] = latestRenewedOn;
        }
    });

    // === Step 4: Count LCO-wise renewal stats ===
    const lcoWiseData = {};

    Object.entries(userLatestRenewal).forEach(([userId, renewedOn]) => {
        const lcoId = userIdToLcoMap[userId];
        if (!lcoId) return;

        if (!lcoWiseData[lcoId]) {
            lcoWiseData[lcoId] = {
                totalRenewedUser: 0,
                todayRenewedUser: 0,
                weeklyRenewedUser: 0,
                monthlyRenewedUser: 0,
            };
        }

        lcoWiseData[lcoId].totalRenewedUser += 1;

        if (renewedOn >= todayStart && renewedOn <= todayEnd)
            lcoWiseData[lcoId].todayRenewedUser += 1;

        if (renewedOn >= weekStart && renewedOn <= weekEnd)
            lcoWiseData[lcoId].weeklyRenewedUser += 1;

        if (renewedOn >= monthStart && renewedOn <= monthEnd)
            lcoWiseData[lcoId].monthlyRenewedUser += 1;
    });

    // === Step 5: Combine LCOs with counts ===
    const result = lcos.map((lco) => {
        const stats = lcoWiseData[lco._id.toString()] || {
            totalRenewedUser: 0,
            todayRenewedUser: 0,
            weeklyRenewedUser: 0,
            monthlyRenewedUser: 0,
        };
        return {
            lcoId: lco._id,
            lcoName: lco.lcoName,
            ...stats,
        };
    });

    return successResponse(res, "LCO-wise renewed user count fetched successfully", { result });
});
