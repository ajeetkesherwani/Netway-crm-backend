const mongoose = require("mongoose");
const PurchasedPlan = require("../../../models/purchasedPlan");
const User = require("../../../models/user");
const Reseller = require("../../../models/retailer");
const Lco = require("../../../models/lco");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");

exports.getRenewedUsersCountByFilter = catchAsync(async (req, res) => {
    const { role, _id: requesterId } = req.user;

    // Handle timezones properly (IST based filtering) ---
    const now = new Date();
    const IST_OFFSET = 5.5 * 60 * 60 * 1000;
    const nowIST = new Date(now.getTime() + IST_OFFSET);

    const startOfDayIST = new Date(nowIST.getFullYear(), nowIST.getMonth(), nowIST.getDate());
    const startOfWeekIST = new Date(startOfDayIST);
    startOfWeekIST.setDate(nowIST.getDate() - nowIST.getDay());
    const startOfMonthIST = new Date(nowIST.getFullYear(), nowIST.getMonth(), 1);

    // Convert back to UTC to compare with DB UTC times
    const startOfDayUTC = new Date(startOfDayIST.getTime() - IST_OFFSET);
    const startOfWeekUTC = new Date(startOfWeekIST.getTime() - IST_OFFSET);
    const startOfMonthUTC = new Date(startOfMonthIST.getTime() - IST_OFFSET);

    // Find all renewed purchased plans ---
    const purchasedPlans = await PurchasedPlan.find({ isRenewed: true })
        .select("userId renewals")
        .lean();

    if (!purchasedPlans.length) {
        return successResponse(res, "No renewal data found", {
            role,
            totalRenewalUsers: 0,
            todayRenewals: 0,
            weekRenewals: 0,
            monthRenewals: 0,
        });
    }

    //  Build user -> latest renewed date map ---
    const userRenewalMap = new Map();
    for (const plan of purchasedPlans) {
        const userId = plan.userId?.toString?.();
        if (!userId) continue;

        if (!Array.isArray(plan.renewals) || plan.renewals.length === 0) continue;

        const lastRenewal = plan.renewals[plan.renewals.length - 1];
        const renewedOn = lastRenewal?.renewedOn ? new Date(lastRenewal.renewedOn) : null;
        if (!renewedOn) continue;

        const existing = userRenewalMap.get(userId);
        if (!existing || renewedOn > existing) userRenewalMap.set(userId, renewedOn);
    }

    if (!userRenewalMap.size) {
        return successResponse(res, "No valid renewal records found", {
            role,
            totalRenewalUsers: 0,
            todayRenewals: 0,
            weekRenewals: 0,
            monthRenewals: 0,
        });
    }

    // Fetch users for those userIds ---
    const userIds = Array.from(userRenewalMap.keys()).map((id) => new mongoose.Types.ObjectId(id));
    const users = await User.find({ _id: { $in: userIds } })
        .select("_id generalInformation.createdFor")
        .lean();

    // --- Role-based filtering logic ---
    let totalRenewalUsers = 0;
    let todayRenewals = 0;
    let weekRenewals = 0;
    let monthRenewals = 0;

    for (const user of users) {
        const { _id, generalInformation } = user;
        const createdFor = generalInformation?.createdFor;

        if (!createdFor?.type || !createdFor?.id) continue;

        // Filter by role
        if (role === "Reseller") {
            if (
                createdFor.type.toLowerCase() !== "retailer" ||
                createdFor.id.toString() !== requesterId.toString()
            )
                continue;
        } else if (role === "Lco") {
            if (
                createdFor.type.toLowerCase() !== "lco" ||
                createdFor.id.toString() !== requesterId.toString()
            )
                continue;
        }

        // If Admin → no restriction

        const latestRenewedOn = userRenewalMap.get(_id.toString());
        if (!latestRenewedOn) continue;

        totalRenewalUsers++;
        if (latestRenewedOn >= startOfDayUTC) todayRenewals++;
        if (latestRenewedOn >= startOfWeekUTC) weekRenewals++;
        if (latestRenewedOn >= startOfMonthUTC) monthRenewals++;
    }

    //  Optional name fetch ---
    let name = null;
    if (role === "Reseller") {
        const r = await Reseller.findById(requesterId).select("resellerName").lean();
        name = r?.resellerName || null;
    } else if (role === "Lco") {
        const l = await Lco.findById(requesterId).select("lcoName").lean();
        name = l?.lcoName || null;
    }

    // Final Response ---
    return successResponse(res, "Renewal user count fetched successfully", {
        role,
        name,
        totalRenewalUsers,
        todayRenewals,
        weekRenewals,
        monthRenewals,
    });
});
