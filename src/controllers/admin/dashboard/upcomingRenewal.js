const User = require("../../../models/user");
const PurchasedPlan = require("../../../models/purchasedPlan");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");

exports.getUpcomingRenewalUsersCount = catchAsync(async (req, res) => {
    const { role, _id } = req.user;

    const currentDate = new Date();
    const startOfToday = new Date(currentDate.setHours(0, 0, 0, 0));
    const endOfToday = new Date(currentDate.setHours(23, 59, 59, 999));

    // Week range
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    // Month range
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59);

    // User filter (role-based)
    const userQuery = { status: "active" };
    if (role === "Reseller" || role === "Lco") {
        userQuery.referredBy = _id;
    }

    const users = await User.find(userQuery).select("_id").lean();
    if (!users.length) {
        return successResponse(res, "No active users found", {
            role,
            name: req.user.name || null,
            totalExpiringUsers: 0,
            todayExpiring: 0,
            weekExpiring: 0,
            monthExpiring: 0
        });
    }

    const userIds = users.map(u => u._id);

    // Fetch all active plans
    const plans = await PurchasedPlan.find({
        userId: { $in: userIds },
        status: "active"
    }).select("userId expiryDate isRenewed renewals").lean();

    let todayExpiring = 0;
    let weekExpiring = 0;
    let monthExpiring = 0;

    const getExpiryDate = (plan) => {
        if (plan.isRenewed && plan.renewals && plan.renewals.length > 0) {
            const latestRenewal = plan.renewals[plan.renewals.length - 1];
            return new Date(latestRenewal.newExpiryDate);
        }
        return new Date(plan.expiryDate);
    };

    plans.forEach(plan => {
        const expiryDate = getExpiryDate(plan);

        if (expiryDate >= startOfToday && expiryDate <= endOfToday) {
            todayExpiring++;
        }
        if (expiryDate >= startOfWeek && expiryDate <= endOfWeek) {
            weekExpiring++;
        }
        if (expiryDate >= startOfMonth && expiryDate <= endOfMonth) {
            monthExpiring++;
        }
    });

    const totalExpiringUsers = plans.length;

    return successResponse(res, "Upcoming expiring users fetched successfully", {
        role,
        name: req.user.name || null,
        totalExpiringUsers,
        todayExpiring,
        weekExpiring,
        monthExpiring
    });
});
