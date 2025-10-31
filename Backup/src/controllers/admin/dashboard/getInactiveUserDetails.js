const User = require("../../../models/user");
const PurchasedPlan = require("../../../models/purchasedPlan");
const catchAsync = require("../../../utils/catchAsync");
const AppError = require("../../../utils/AppError");
const { successResponse } = require("../../../utils/responseHandler");
const { monthNames } = require("../../../utils/monthNames");
const Package = require("../../../models/package");

exports.getInactiveUsersDetailByFilter = catchAsync(async (req, res, next) => {
    const { filter, month, year } = req.query;
    const { role, _id } = req.user;

    const filterValue = filter || "day";
    const currentDate = new Date();
    const targetYear = year || currentDate.getFullYear();

    let targetEndMonth;
    if (month) {
        targetEndMonth = parseInt(month);
    } else {
        targetEndMonth = parseInt(targetYear) === currentDate.getFullYear() ? currentDate.getMonth() + 1 : 12;
    }

    const startDate = new Date(targetYear, 0, 1);
    const endDate = new Date(targetYear, targetEndMonth, 0, 23, 59, 59);

    // ✅ Only inactive users
    let matchQuery = { createdAt: { $gte: startDate, $lte: endDate }, status: "inactive" };
    if (role === "reseller" || role === "lco") matchQuery.referredBy = _id;

    const users = await User.find(matchQuery).lean();

    const usersWithPlans = await Promise.all(users.map(async (user) => {
        const purchasedPlan = await PurchasedPlan.findOne({
            userId: user._id,
            status: "active" // still fetch only active purchased plans
        }).sort({ purchaseDate: -1 }).lean();

        let packageDetails = null;
        if (purchasedPlan && purchasedPlan.packageId) {
            const packageData = await Package.findById(purchasedPlan.packageId).lean();
            if (packageData) {
                packageDetails = {
                    packageName: packageData.name,
                    validity: `${packageData.validity.number} ${packageData.validity.unit}`,
                };
            }
        }

        return {
            username: user.generalInformation?.username || "",
            name: user.generalInformation?.name || "",
            email: user.generalInformation?.email || "",
            phone: user.generalInformation?.phone || "",
            wallet_balance: user.walletBalance || 0,
            purchasedPlan: purchasedPlan ? {
                ...packageDetails,
                startDate: purchasedPlan.startDate,
                expiryDate: purchasedPlan.expiryDate,
                amountPaid: purchasedPlan.amountPaid,
            } : null,
            createdAt: user.createdAt
        };
    }));

    let aggregated = {};
    if (filterValue === "day") {
        aggregated = usersWithPlans.reduce((acc, user) => {
            const date = new Date(user.createdAt);
            const day = date.getUTCDate();
            const monthNum = date.getUTCMonth() + 1;
            const yearNum = date.getUTCFullYear();
            const monthName = monthNames[monthNum - 1];

            const key = `${day}-${monthNum}-${yearNum}`;
            if (!acc[key]) acc[key] = { _id: { day, month: monthNum, year: yearNum }, monthName, totalUsers: 0, users: [] };
            acc[key].totalUsers += 1;
            acc[key].users.push(user);
            return acc;
        }, {});
    } else if (filterValue === "week") {
        aggregated = usersWithPlans.reduce((acc, user) => {
            const date = new Date(user.createdAt);
            const dayOfMonth = date.getUTCDate();
            const monthNum = date.getUTCMonth() + 1;
            const yearNum = date.getUTCFullYear();
            const monthName = monthNames[monthNum - 1];

            let monthWeek = dayOfMonth <= 7 ? 1 : dayOfMonth <= 14 ? 2 : dayOfMonth <= 21 ? 3 : dayOfMonth <= 28 ? 4 : 5;
            const weekRange = monthWeek === 1 ? "1–7" : monthWeek === 2 ? "8–14" : monthWeek === 3 ? "15–21" : monthWeek === 4 ? "22–28" : "29–31";
            const key = `${monthWeek}-${monthNum}-${yearNum}`;

            if (!acc[key]) acc[key] = { _id: { monthWeek, month: monthNum, year: yearNum }, monthName, weekRange, totalUsers: 0, users: [] };
            acc[key].totalUsers += 1;
            acc[key].users.push(user);
            return acc;
        }, {});
    } else if (filterValue === "month") {
        aggregated = usersWithPlans.reduce((acc, user) => {
            const date = new Date(user.createdAt);
            const monthNum = date.getUTCMonth() + 1;
            const yearNum = date.getUTCFullYear();
            const monthName = monthNames[monthNum - 1];

            const key = `${monthNum}-${yearNum}`;
            if (!acc[key]) acc[key] = { _id: { month: monthNum, year: yearNum }, monthName, totalUsers: 0, users: [] };
            acc[key].totalUsers += 1;
            acc[key].users.push(user);
            return acc;
        }, {});
    } else {
        return next(new AppError("Invalid filter. Use day/week/month", 400));
    }

    return successResponse(res, `${filterValue}-wise inactive user counts`, Object.values(aggregated));
});
