// const User = require("../../../models/user");
// const PurchasedPlan = require("../../../models/purchasedPlan");
// const catchAsync = require("../../../utils/catchAsync");
// const AppError = require("../../../utils/AppError");
// const { successResponse } = require("../../../utils/responseHandler");
// const { monthNames } = require("../../../utils/monthNames");
// const Package = require("../../../models/package");

// exports.getRegisterUsersByFilter = catchAsync(async (req, res, next) => {
//     const { filter, month, year } = req.query;
//     const { role, _id } = req.user;

//     const filterValue = filter || "day";
//     const currentDate = new Date();
//     const targetYear = year || currentDate.getFullYear();

//     // Updated logic for targetEndMonth
//     let targetEndMonth;
//     if (month) {
//         // specific month passed
//         targetEndMonth = parseInt(month);
//     } else {
//         // only year passed
//         if (parseInt(targetYear) === currentDate.getFullYear()) {
//             // current year → upto current month
//             targetEndMonth = currentDate.getMonth() + 1;
//         } else {
//             // past year → full 12 months
//             targetEndMonth = 12;
//         }
//     }

//     const startDate = new Date(targetYear, 0, 1);
//     const endDate = new Date(targetYear, targetEndMonth, 0, 23, 59, 59);

//     let matchQuery = { createdAt: { $gte: startDate, $lte: endDate } };
//     if (role === "reseller" || role === "lco") matchQuery.referredBy = _id;

//     const users = await User.find(matchQuery).lean();

//     const usersWithPlans = await Promise.all(users.map(async (user) => {
//         const purchasedPlan = await PurchasedPlan.findOne({
//             userId: user._id,
//             status: "active"
//         }).sort({ purchaseDate: -1 }).lean();

//         let packageDetails = null;
//         if (purchasedPlan && purchasedPlan.packageId) {
//             const packageData = await Package.findById(purchasedPlan.packageId).lean();
//             if (packageData) {
//                 packageDetails = {
//                     packageName: packageData.name,
//                     validity: `${packageData.validity.number} ${packageData.validity.unit}`,
//                 };
//             }
//         }

//         return {
//             username: user.generalInformation?.username || "",
//             name: user.generalInformation?.name || "",
//             email: user.generalInformation?.email || "",
//             phone: user.generalInformation?.phone || "",
//             wallet_balance: user.walletBalance || 0,
//             purchasedPlan: purchasedPlan ? {
//                 ...packageDetails,
//                 startDate: purchasedPlan.startDate,
//                 expiryDate: purchasedPlan.expiryDate,
//                 amountPaid: purchasedPlan.amountPaid,
//             } : null,
//             createdAt: user.createdAt
//         };
//     }));

//     let aggregated = {};
//     if (filterValue === "day") {
//         aggregated = usersWithPlans.reduce((acc, user) => {
//             const date = new Date(user.createdAt);
//             const day = date.getUTCDate();
//             const monthNum = date.getUTCMonth() + 1;
//             const yearNum = date.getUTCFullYear();
//             const monthName = monthNames[monthNum - 1];

//             const key = `${day}-${monthNum}-${yearNum}`;
//             if (!acc[key]) acc[key] = { _id: { day, month: monthNum, year: yearNum }, monthName, totalUsers: 0, users: [] };
//             acc[key].totalUsers += 1;
//             acc[key].users.push(user);
//             return acc;
//         }, {});
//     } else if (filterValue === "week") {
//         aggregated = usersWithPlans.reduce((acc, user) => {
//             const date = new Date(user.createdAt);
//             const dayOfMonth = date.getUTCDate();
//             const monthNum = date.getUTCMonth() + 1;
//             const yearNum = date.getUTCFullYear();
//             const monthName = monthNames[monthNum - 1];

//             let monthWeek = dayOfMonth <= 7 ? 1 : dayOfMonth <= 14 ? 2 : dayOfMonth <= 21 ? 3 : dayOfMonth <= 28 ? 4 : 5;
//             const weekRange = monthWeek === 1 ? "1–7" : monthWeek === 2 ? "8–14" : monthWeek === 3 ? "15–21" : monthWeek === 4 ? "22–28" : "29–31";
//             const key = `${monthWeek}-${monthNum}-${yearNum}`;

//             if (!acc[key]) acc[key] = { _id: { monthWeek, month: monthNum, year: yearNum }, monthName, weekRange, totalUsers: 0, users: [] };
//             acc[key].totalUsers += 1;
//             acc[key].users.push(user);
//             return acc;
//         }, {});
//     } else if (filterValue === "month") {
//         aggregated = usersWithPlans.reduce((acc, user) => {
//             const date = new Date(user.createdAt);
//             const monthNum = date.getUTCMonth() + 1;
//             const yearNum = date.getUTCFullYear();
//             const monthName = monthNames[monthNum - 1];

//             const key = `${monthNum}-${yearNum}`;
//             if (!acc[key]) acc[key] = { _id: { month: monthNum, year: yearNum }, monthName, totalUsers: 0, users: [] };
//             acc[key].totalUsers += 1;
//             acc[key].users.push(user);
//             return acc;
//         }, {});
//     } else {
//         return next(new AppError("Invalid filter. Use day/week/month", 400));
//     }

//     return successResponse(res, `${filterValue}-wise user counts`, Object.values(aggregated));

// });

const User = require("../../../models/user");
const PurchasedPlan = require("../../../models/purchasedPlan");
const Package = require("../../../models/package");
const catchAsync = require("../../../utils/catchAsync");
const AppError = require("../../../utils/AppError");
const { successResponse } = require("../../../utils/responseHandler");
const { monthNames } = require("../../../utils/monthNames");

exports.getRegisterUsersByFilter = catchAsync(async (req, res, next) => {
    const { filter, month, year } = req.query;
    const { role, _id } = req.user;

    const filterValue = filter || "day";
    const currentDate = new Date();
    const targetYear = parseInt(year) || currentDate.getFullYear();
    let targetEndMonth = month ? parseInt(month) : (targetYear === currentDate.getFullYear() ? currentDate.getMonth() + 1 : 12);

    const startDate = new Date(targetYear, 0, 1);
    const endDate = new Date(targetYear, targetEndMonth, 0, 23, 59, 59);

    // Users query
    let matchQuery = { createdAt: { $gte: startDate, $lte: endDate } };
    if (role === "reseller" || role === "lco") matchQuery["generalInformation.createdBy.id"] = _id;

    const users = await User.find(matchQuery).lean();

    const usersWithPlans = await Promise.all(users.map(async (user) => {
        // Latest purchased plan
        const purchasedPlan = await PurchasedPlan.findOne({ userId: user._id })
            .sort({ purchaseDate: -1 })
            .populate("packageId", "name basePrice validity")
            .lean();

        let packageDetails = {
            packageName: "N/A",
            planMRP: 0,
            planValidity: "N/A",
            planStatus: "Inactive",
            planStartDate: null,
            planExpiryDate: null,
            amountPaid: 0
        };

        if (purchasedPlan) {
            let planStartDate = purchasedPlan.startDate;
            let planExpiryDate = purchasedPlan.expiryDate;
            let amountPaid = purchasedPlan.amountPaid;
            let planStatus = purchasedPlan.status || "Inactive";

            // If renewed, use last renewal
            if (purchasedPlan.isRenewed && purchasedPlan.renewals && purchasedPlan.renewals.length > 0) {
                const lastRenewal = purchasedPlan.renewals[purchasedPlan.renewals.length - 1];
                planStartDate = lastRenewal.renewedOn;
                planExpiryDate = lastRenewal.newExpiryDate;
                amountPaid = lastRenewal.amountPaid;
            }

            if (purchasedPlan.packageId) {
                const pkg = purchasedPlan.packageId;
                packageDetails = {
                    packageName: pkg.name,
                    planMRP: pkg.basePrice || 0,
                    planValidity: pkg.validity ? `${pkg.validity.number} ${pkg.validity.unit}` : "N/A",
                    planStatus,
                    planStartDate,
                    planExpiryDate,
                    amountPaid
                };
            }
        }

        // Franchisee info from createdFor
        let franchiseeName = "N/A";
        if (user.generalInformation?.createdFor?.id) {
            const franchiseeUser = await User.findById(user.generalInformation.createdFor.id)
                .select("generalInformation.name")
                .lean();
            if (franchiseeUser) franchiseeName = franchiseeUser.generalInformation?.name || "N/A";
        }

        return {
            userId: user.generalInformation?.username || "",
            customerName: user.generalInformation?.name || "",
            currentPlan: packageDetails.packageName,
            franchisee: franchiseeName,
            walletBalance: user.walletBalance || 0,
            planValidity: packageDetails.planValidity,
            planStatus: packageDetails.planStatus,
            planStartDate: packageDetails.planStartDate,
            expiryDate: packageDetails.planExpiryDate,
            amountPaid: packageDetails.amountPaid
        };
    }));

    // Aggregate by filter
    let aggregated = {};
    if (filterValue === "day") {
        aggregated = usersWithPlans.reduce((acc, u) => {
            const date = new Date(u.createdDate);
            const day = date.getUTCDate();
            const monthNum = date.getUTCMonth() + 1;
            const yearNum = date.getUTCFullYear();
            const key = `${day}-${monthNum}-${yearNum}`;
            if (!acc[key]) acc[key] = { _id: { day, month: monthNum, year: yearNum }, monthName: monthNames[monthNum - 1], totalUsers: 0, users: [] };
            acc[key].totalUsers += 1;
            acc[key].users.push(u);
            return acc;
        }, {});
    } else if (filterValue === "week") {
        aggregated = usersWithPlans.reduce((acc, u) => {
            const date = new Date(u.createdDate);
            const dayOfMonth = date.getUTCDate();
            const monthNum = date.getUTCMonth() + 1;
            const yearNum = date.getUTCFullYear();
            const monthWeek = dayOfMonth <= 7 ? 1 : dayOfMonth <= 14 ? 2 : dayOfMonth <= 21 ? 3 : dayOfMonth <= 28 ? 4 : 5;
            const weekRange = monthWeek === 1 ? "1–7" : monthWeek === 2 ? "8–14" : monthWeek === 3 ? "15–21" : monthWeek === 4 ? "22–28" : "29–31";
            const key = `${monthWeek}-${monthNum}-${yearNum}`;
            if (!acc[key]) acc[key] = { _id: { monthWeek, month: monthNum, year: yearNum }, monthName: monthNames[monthNum - 1], weekRange, totalUsers: 0, users: [] };
            acc[key].totalUsers += 1;
            acc[key].users.push(u);
            return acc;
        }, {});
    } else if (filterValue === "month") {
        aggregated = usersWithPlans.reduce((acc, u) => {
            const date = new Date(u.createdDate);
            const monthNum = date.getUTCMonth() + 1;
            const yearNum = date.getUTCFullYear();
            const key = `${monthNum}-${yearNum}`;
            if (!acc[key]) acc[key] = { _id: { month: monthNum, year: yearNum }, monthName: monthNames[monthNum - 1], totalUsers: 0, users: [] };
            acc[key].totalUsers += 1;
            acc[key].users.push(u);
            return acc;
        }, {});
    } else {
        return next(new AppError("Invalid filter. Use day/week/month", 400));
    }

    return successResponse(res, `${filterValue}-wise registered user details`, Object.values(aggregated));
});
