const User = require("../../../models/user");
const PurchasedPlan = require("../../../models/purchasedPlan");
const catchAsync = require("../../../utils/catchAsync");
const AppError = require("../../../utils/AppError");
const { successResponse } = require("../../../utils/responseHandler");

exports.getUpcomingRenewalUsersDetails = catchAsync(async (req, res, next) => {
    const { filter, month, year } = req.query;
    const { role, _id } = req.user;

    const filterValue = filter || "day";
    const currentDate = new Date();
    const targetYear = parseInt(year) || currentDate.getFullYear();

    let targetEndMonth;
    if (month) targetEndMonth = parseInt(month);
    else targetEndMonth = targetYear === currentDate.getFullYear() ? currentDate.getMonth() + 1 : 12;

    const startDate = new Date(targetYear, 0, 1);
    const endDate = new Date(targetYear, targetEndMonth, 0, 23, 59, 59);

    // Fetch active users
    const userQuery = { status: "active", createdAt: { $gte: startDate, $lte: endDate } };
    if (role === "reseller" || role === "lco") userQuery.referredBy = _id;

    const users = await User.find(userQuery)
        .select("_id generalInformation.name generalInformation.username generalInformation.email generalInformation.phone status walletBalance createdAt")
        .lean();

    if (!users.length) return successResponse(res, "No active users found", []);

    const userIds = users.map(u => u._id);

    const today = new Date();
    const next5Days = new Date(today);
    next5Days.setDate(today.getDate() + 5);

    // Fetch plans
    const plans = await PurchasedPlan.find({
        userId: { $in: userIds },
        status: "active",
    })
        .populate("packageId", "packageName validity amount")
        .select("userId expiryDate amountPaid isRenewed renewals packageId")
        .lean();

    if (!plans.length) return successResponse(res, "No upcoming renewals found", []);

    const aggregated = {};

    plans.forEach(plan => {
        // Determine expiry date
        let expiryToCheck;
        if (plan.isRenewed && plan.renewals && plan.renewals.length > 0) {
            const lastRenewal = plan.renewals[plan.renewals.length - 1];
            expiryToCheck = new Date(lastRenewal.newExpiryDate);
        } else {
            expiryToCheck = new Date(plan.expiryDate);
        }

        // Only upcoming 5 days
        if (expiryToCheck < today || expiryToCheck > next5Days) return;

        const day = expiryToCheck.getUTCDate();
        const monthNum = expiryToCheck.getUTCMonth() + 1;
        const yearNum = expiryToCheck.getUTCFullYear();
        let key;

        if (filterValue === "day") key = `${day}-${monthNum}-${yearNum}`;
        else if (filterValue === "week") key = `${Math.ceil(day / 7)}-${monthNum}-${yearNum}`;
        else if (filterValue === "month") key = `${monthNum}-${yearNum}`;
        else return next(new AppError("Invalid filter. Use day/week/month", 400));

        if (!aggregated[key])
            aggregated[key] = {
                _id:
                    filterValue === "day"
                        ? { day, month: monthNum, year: yearNum }
                        : filterValue === "week"
                            ? { monthWeek: Math.ceil(day / 7), month: monthNum, year: yearNum }
                            : { month: monthNum, year: yearNum },
                totalUsers: 0,
                users: [],
            };

        const userData = users.find(u => String(u._id) === String(plan.userId));
        if (userData) {
            aggregated[key].totalUsers += 1;
            aggregated[key].users.push({
                userId: userData.generalInformation.username,
                customerName: userData.generalInformation.name,
                mobile: userData.generalInformation.phone,
                email: userData.generalInformation.email,
                planName: plan.packageId.packageName,
                expiryDate: expiryToCheck,
                currentStatus: userData.status,
                walletBalance: userData.walletBalance,
                planAmount: plan.packageId.amount,
                renewalAmount: plan.amountPaid
            });
        }
    });

    return successResponse(res, `${filterValue}-wise upcoming renewal details`, Object.values(aggregated));
});
