const mongoose = require("mongoose");
const User = require("../../../models/user");
const Reseller = require("../../../models/retailer");
const Lco = require("../../../models/lco");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");

exports.getInActiveUsersCountByFilter = catchAsync(async (req, res) => {
    const { role, _id } = req.user;

    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Base query – only active users
    let matchQuery = { status: "Inactive" };

    let resellerOrLcoName = null;

    //  Role-based filtering
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

    return successResponse(res, "InActive user summary fetched successfully", responseData);
});
