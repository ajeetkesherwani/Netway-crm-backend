// const User = require("../../../models/user");
// const catchAsync = require("../../../utils/catchAsync");
// const AppError = require("../../../utils/AppError");
// const { successResponse } = require("../../../utils/responseHandler");
// const { monthNames } = require("../../../utils/monthNames");

// exports.getActiveUsersCountByFilter = catchAsync(async (req, res, next) => {
//     const { filter, month, year } = req.query;
//     const { role, _id } = req.user;

//     const filterValue = filter || "day";
//     const currentDate = new Date();
//     const targetYear = year || currentDate.getFullYear();

//     // Determine targetEndMonth
//     let targetEndMonth;
//     if (month) {
//         targetEndMonth = parseInt(month); // specific month
//     } else {
//         targetEndMonth = parseInt(targetYear) === currentDate.getFullYear() ? currentDate.getMonth() + 1 : 12;
//     }

//     const startDate = new Date(targetYear, 0, 1);
//     const endDate = new Date(targetYear, targetEndMonth, 0, 23, 59, 59);

//     // ✅ Only active users
//     let matchQuery = { createdAt: { $gte: startDate, $lte: endDate }, status: "active" };
//     if (role === "reseller" || role === "lco") matchQuery.referredBy = _id;

//     const users = await User.find(matchQuery).select("createdAt").lean();

//     let aggregated = {};
//     if (filterValue === "day") {
//         aggregated = users.reduce((acc, user) => {
//             const date = new Date(user.createdAt);
//             const day = date.getUTCDate();
//             const monthNum = date.getUTCMonth() + 1;
//             const yearNum = date.getUTCFullYear();

//             const key = `${day}-${monthNum}-${yearNum}`;
//             if (!acc[key]) acc[key] = { _id: { day, month: monthNum, year: yearNum }, totalUsers: 0 };
//             acc[key].totalUsers += 1;
//             return acc;
//         }, {});
//     } else if (filterValue === "week") {
//         aggregated = users.reduce((acc, user) => {
//             const date = new Date(user.createdAt);
//             const dayOfMonth = date.getUTCDate();
//             const monthNum = date.getUTCMonth() + 1;
//             const yearNum = date.getUTCFullYear();

//             let monthWeek = dayOfMonth <= 7 ? 1 : dayOfMonth <= 14 ? 2 : dayOfMonth <= 21 ? 3 : dayOfMonth <= 28 ? 4 : 5;
//             const key = `${monthWeek}-${monthNum}-${yearNum}`;
//             if (!acc[key]) acc[key] = { _id: { monthWeek, month: monthNum, year: yearNum }, totalUsers: 0 };
//             acc[key].totalUsers += 1;
//             return acc;
//         }, {});
//     } else if (filterValue === "month") {
//         aggregated = users.reduce((acc, user) => {
//             const date = new Date(user.createdAt);
//             const monthNum = date.getUTCMonth() + 1;
//             const yearNum = date.getUTCFullYear();

//             const key = `${monthNum}-${yearNum}`;
//             if (!acc[key]) acc[key] = { _id: { month: monthNum, year: yearNum }, totalUsers: 0 };
//             acc[key].totalUsers += 1;
//             return acc;
//         }, {});
//     } else {
//         return next(new AppError("Invalid filter. Use day/week/month", 400));
//     }

//     return successResponse(res, `${filterValue}-wise active user counts`, Object.values(aggregated));
// });


const mongoose = require("mongoose");
const User = require("../../../models/user");
const Reseller = require("../../../models/retailer");
const Lco = require("../../../models/lco");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");

exports.getActiveUsersCountByFilter = catchAsync(async (req, res) => {
    const { role, _id } = req.user;

    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Base query – only active users
    let matchQuery = { status: "active" };

    let resellerOrLcoName = null;

    // 🔹 Role-based filtering
    if (role === "Reseller") {
        matchQuery["generalInformation.createdFor.id"] = _id;
        matchQuery["generalInformation.createdFor.type"] = "Retailer";

        const reseller = await Reseller.findById(_id).select("resellerName").lean();
        resellerOrLcoName = reseller?.resellerName || null;

    } else if (role === "Lco") {
        matchQuery["generalInformation.createdFor.id"] = _id;
        matchQuery["generalInformation.createdFor.type"] = "Lco";

        const lco = await Lco.findById(_id).select("lcoName").lean();
        resellerOrLcoName = lco?.lcoName || null;
    }

    // Fetch users (only active ones)
    const users = await User.find(matchQuery).select("updatedAt").lean();

    // Counts based on updatedAt (not createdAt)
    const totalUsers = users.length;
    const todayUsers = users.filter(u => new Date(u.updatedAt) >= startOfDay).length;
    const weekUsers = users.filter(u => new Date(u.updatedAt) >= startOfWeek).length;
    const monthUsers = users.filter(u => new Date(u.updatedAt) >= startOfMonth).length;

    const responseData = {
        role,
        name: resellerOrLcoName,
        totalUsers,
        todayUsers,
        weekUsers,
        monthUsers
    };

    return successResponse(res, "Active user summary fetched successfully", responseData);
});
