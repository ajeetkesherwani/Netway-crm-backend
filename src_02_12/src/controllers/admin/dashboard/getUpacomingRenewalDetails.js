// const mongoose = require("mongoose");
// const User = require("../../../models/user");
// const PurchasedPlan = require("../../../models/purchasedPlan");
// const Package = require("../../../models/package");
// const Reseller = require("../../../models/retailer");
// const Lco = require("../../../models/lco");
// const catchAsync = require("../../../utils/catchAsync");
// const AppError = require("../../../utils/AppError");
// const { successResponse } = require("../../../utils/responseHandler");

// exports.getUpcomingRenewalUsersDetails = catchAsync(async (req, res, next) => {
//     const { filter = "day", year, month } = req.query;
//     const { role, _id } = req.user;

//     const now = new Date();
//     const selectedYear = parseInt(year) || now.getFullYear();
//     const selectedMonth = month ? parseInt(month) - 1 : now.getMonth(); // 0-based month

//     // === ROLE BASED FILTER ===
//     let matchCondition = {};
//     let name = "";

//     if (role === "Reseller") {
//         matchCondition["generalInformation.createdBy.id"] = new mongoose.Types.ObjectId(_id);
//         const reseller = await Reseller.findById(_id).select("resellerName").lean();
//         name = reseller?.resellerName || "Unknown Reseller";
//     } else if (role === "Lco") {
//         matchCondition["generalInformation.createdBy.id"] = new mongoose.Types.ObjectId(_id);
//         const lco = await Lco.findById(_id).select("lcoName").lean();
//         name = lco?.lcoName || "Unknown LCO";
//     } else {
//         name = "Admin Dashboard";
//     }

//     // === DATE RANGE FILTER ===
//     let startDate, endDate, format;
//     if (filter === "day") {
//         startDate = new Date(selectedYear, selectedMonth, 1);
//         endDate = new Date(selectedYear, selectedMonth + 1, 0, 23, 59, 59);
//         format = "day";
//     } else if (filter === "week") {
//         startDate = new Date(selectedYear, selectedMonth, 1);
//         endDate = new Date(selectedYear, selectedMonth + 1, 0, 23, 59, 59);
//         format = "week";
//     } else if (filter === "month") {
//         startDate = new Date(selectedYear, 0, 1);
//         endDate = new Date(selectedYear, 11, 31, 23, 59, 59);
//         format = "month";
//     } else {
//         return next(new AppError("Invalid filter. Use day/week/month", 400));
//     }

//     // === GET USERS ===
//     const users = await User.find(matchCondition)
//         .select("_id generalInformation walletBalance status")
//         .lean();

//     if (!users.length)
//         return successResponse(res, "No users found for this role", {
//             totalUpcomingRenewals: 0,
//             result: [],
//         });

//     const userIds = users.map((u) => u._id);

//     // === FETCH ACTIVE PLANS ===
//     const plans = await PurchasedPlan.find({
//         userId: { $in: userIds },
//         status: "active",
//     })
//         .populate("packageId", "name basePrice validity")
//         .select("userId expiryDate amountPaid isRenewed renewals packageId status")
//         .lean();

//     if (!plans.length)
//         return successResponse(res, "No upcoming renewals found", {
//             totalUpcomingRenewals: 0,
//             result: [],
//         });

//     const upcomingRenewals = [];

//     for (const plan of plans) {
//         let expiryToCheck;
//         if (plan.isRenewed && plan.renewals?.length) {
//             const lastRenewal = plan.renewals[plan.renewals.length - 1];
//             expiryToCheck = new Date(lastRenewal.newExpiryDate);
//         } else {
//             expiryToCheck = new Date(plan.expiryDate);
//         }

//         if (expiryToCheck < startDate || expiryToCheck > endDate) continue;

//         const userData = users.find((u) => String(u._id) === String(plan.userId));
//         if (!userData) continue;

//         upcomingRenewals.push({
//             username: userData.generalInformation?.username || "",
//             customerName: userData.generalInformation?.name || "",
//             mobile: userData.generalInformation?.phone || "",
//             email: userData.generalInformation?.email || "",
//             planName: plan.packageId?.name || "N/A",
//             expiryDate: expiryToCheck,
//             planStatus: plan.status,
//             walletBalance: userData.walletBalance || 0,
//             planAmount: plan.packageId?.basePrice || 0,
//             renewalAmount: plan.amountPaid || 0,
//         });
//     }

//     // === GROUPING LOGIC ===
//     let result = [];

//     if (format === "day") {
//         const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
//         for (let d = 1; d <= daysInMonth; d++) {
//             const dayUsers = upcomingRenewals.filter(
//                 (u) =>
//                     new Date(u.expiryDate).getDate() === d &&
//                     new Date(u.expiryDate).getMonth() === selectedMonth
//             );
//             result.push({
//                 label: `${d} ${new Date(selectedYear, selectedMonth).toLocaleString("default", {
//                     month: "long",
//                 })}`,
//                 count: dayUsers.length,
//                 users: dayUsers,
//             });
//         }
//     } else if (format === "week") {
//         const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
//         let startDay = 1;
//         while (startDay <= daysInMonth) {
//             const endDay = Math.min(startDay + 6, daysInMonth);
//             const sDate = new Date(selectedYear, selectedMonth, startDay);
//             const eDate = new Date(selectedYear, selectedMonth, endDay, 23, 59, 59);
//             const weekUsers = upcomingRenewals.filter((u) => {
//                 const d = new Date(u.expiryDate);
//                 return d >= sDate && d <= eDate;
//             });
//             result.push({
//                 label: `Week ${result.length + 1} (${startDay}-${endDay} ${sDate.toLocaleString(
//                     "default",
//                     { month: "short" }
//                 )})`,
//                 count: weekUsers.length,
//                 users: weekUsers,
//             });
//             startDay += 7;
//         }
//     } else if (format === "month") {
//         const monthNames = [
//             "January", "February", "March", "April", "May", "June",
//             "July", "August", "September", "October", "November", "December",
//         ];
//         for (let m = 0; m < 12; m++) {
//             const monthUsers = upcomingRenewals.filter(
//                 (u) => new Date(u.expiryDate).getMonth() === m
//             );
//             result.push({
//                 label: monthNames[m],
//                 count: monthUsers.length,
//                 users: monthUsers,
//             });
//         }
//     }

//     // === FINAL RESPONSE ===
//     return successResponse(res, "Upcoming renewal users fetched successfully", {
//         role,
//         name,
//         filter,
//         year: selectedYear,
//         month: selectedMonth + 1,
//         totalUpcomingRenewals: upcomingRenewals.length,
//         result,
//     });
// });


const mongoose = require("mongoose");
const User = require("../../../models/user");
const PurchasedPlan = require("../../../models/purchasedPlan");
const Package = require("../../../models/package");
const Reseller = require("../../../models/retailer");
const Lco = require("../../../models/lco");
const catchAsync = require("../../../utils/catchAsync");
const AppError = require("../../../utils/AppError");
const { successResponse } = require("../../../utils/responseHandler");

exports.getUpcomingRenewalUsersDetails = catchAsync(async (req, res, next) => {
    const { filter = "day", year, month } = req.query;
    const { role, _id } = req.user;

    const now = new Date();
    const selectedYear = parseInt(year) || now.getFullYear();
    const selectedMonth = month ? parseInt(month) - 1 : now.getMonth(); // 0-based month

    // === ROLE BASED FILTER ===
    let matchCondition = {};
    let name = "";

    if (role === "Reseller") {
        matchCondition["generalInformation.createdFor.type"] = "Retailer";
        matchCondition["generalInformation.createdFor.id"] = new mongoose.Types.ObjectId(_id);

        const reseller = await Reseller.findById(_id).select("resellerName").lean();
        name = reseller?.resellerName || "Unknown Reseller";
    }
    else if (role === "Lco") {
        matchCondition["generalInformation.createdFor.type"] = "Lco";
        matchCondition["generalInformation.createdFor.id"] = new mongoose.Types.ObjectId(_id);

        const lco = await Lco.findById(_id).select("lcoName").lean();
        name = lco?.lcoName || "Unknown LCO";
    }
    else if (role === "Admin") {
        name = "Admin Dashboard";
    }

    // === DATE RANGE FILTER ===
    let startDate, endDate, format;
    if (filter === "day") {
        startDate = new Date(selectedYear, selectedMonth, 1);
        endDate = new Date(selectedYear, selectedMonth + 1, 0, 23, 59, 59);
        format = "day";
    } else if (filter === "week") {
        startDate = new Date(selectedYear, selectedMonth, 1);
        endDate = new Date(selectedYear, selectedMonth + 1, 0, 23, 59, 59);
        format = "week";
    } else if (filter === "month") {
        startDate = new Date(selectedYear, 0, 1);
        endDate = new Date(selectedYear, 11, 31, 23, 59, 59);
        format = "month";
    } else {
        return next(new AppError("Invalid filter. Use day/week/month", 400));
    }

    // === GET USERS (ROLE FILTERED) ===
    const users = await User.find(matchCondition)
        .select("_id generalInformation walletBalance status")
        .lean();

    if (!users.length) {
        return successResponse(res, "No users found for this role", {
            totalUpcomingRenewals: 0,
            result: [],
        });
    }

    const userIds = users.map((u) => u._id);

    // === FETCH ALL PLANS (STATUS KO IGNORE KARO - SARE LENE HAIN) ===
    const plans = await PurchasedPlan.find({
        userId: { $in: userIds },
    })
        .populate("packageId", "name basePrice validity")
        .select("userId expiryDate amountPaid isRenewed renewals packageId status")
        .lean();

    if (!plans.length) {
        return successResponse(res, "No plans found", {
            totalUpcomingRenewals: 0,
            result: [],
        });
    }

    // === LOGIC TO CHECK EXPIRY BASED ON isRenewed FLAG ===
    const upcomingRenewals = [];

    for (const plan of plans) {
        let expiryToCheck;

        if (plan.isRenewed && plan.renewals?.length > 0) {
            const lastRenewal = plan.renewals[plan.renewals.length - 1];
            expiryToCheck = new Date(lastRenewal.newExpiryDate);
        } else {
            expiryToCheck = new Date(plan.expiryDate);
        }

        // === FILTER RANGE CHECK ===
        if (expiryToCheck < startDate || expiryToCheck > endDate) continue;

        const userData = users.find((u) => String(u._id) === String(plan.userId));
        if (!userData) continue;

        upcomingRenewals.push({
            username: userData.generalInformation?.username || "",
            customerName: userData.generalInformation?.name || "",
            mobile: userData.generalInformation?.phone || "",
            email: userData.generalInformation?.email || "",
            planName: plan.packageId?.name || "N/A",
            expiryDate: expiryToCheck,
            planStatus: plan.status,
            walletBalance: userData.walletBalance || 0,
            planAmount: plan.packageId?.basePrice || 0,
            renewalAmount: plan.amountPaid || 0,
            isRenewed: plan.isRenewed,
        });
    }

    // === GROUPING LOGIC ===
    let result = [];

    if (format === "day") {
        const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
        for (let d = 1; d <= daysInMonth; d++) {
            const dayUsers = upcomingRenewals.filter(
                (u) =>
                    new Date(u.expiryDate).getDate() === d &&
                    new Date(u.expiryDate).getMonth() === selectedMonth
            );
            result.push({
                label: `${d} ${new Date(selectedYear, selectedMonth).toLocaleString("default", {
                    month: "long",
                })}`,
                count: dayUsers.length,
                users: dayUsers,
            });
        }
    } else if (format === "week") {
        const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
        let startDay = 1;
        while (startDay <= daysInMonth) {
            const endDay = Math.min(startDay + 6, daysInMonth);
            const sDate = new Date(selectedYear, selectedMonth, startDay);
            const eDate = new Date(selectedYear, selectedMonth, endDay, 23, 59, 59);
            const weekUsers = upcomingRenewals.filter((u) => {
                const d = new Date(u.expiryDate);
                return d >= sDate && d <= eDate;
            });
            result.push({
                label: `Week ${result.length + 1} (${startDay}-${endDay} ${sDate.toLocaleString(
                    "default",
                    { month: "short" }
                )})`,
                count: weekUsers.length,
                users: weekUsers,
            });
            startDay += 7;
        }
    } else if (format === "month") {
        const monthNames = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December",
        ];
        for (let m = 0; m < 12; m++) {
            const monthUsers = upcomingRenewals.filter(
                (u) => new Date(u.expiryDate).getMonth() === m
            );
            result.push({
                label: monthNames[m],
                count: monthUsers.length,
                users: monthUsers,
            });
        }
    }

    // === FINAL RESPONSE ===
    return successResponse(res, "Upcoming renewal users fetched successfully", {
        role,
        name,
        filter,
        year: selectedYear,
        month: selectedMonth + 1,
        totalUpcomingRenewals: upcomingRenewals.length,
        result,
    });
});
