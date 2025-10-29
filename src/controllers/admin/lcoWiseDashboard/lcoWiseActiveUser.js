const mongoose = require("mongoose");
const User = require("../../../models/user");
const Lco = require("../../../models/lco");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");

exports.getLcoWiseActiveUserCountByReseller = catchAsync(async (req, res) => {
    const { resellerId } = req.params;

    if (!resellerId || !mongoose.Types.ObjectId.isValid(resellerId)) {
        return successResponse(res, "Invalid or missing reseller ID", { result: [] });
    }

    const now = new Date();

    // Define date ranges
    const todayStart = new Date(now.setHours(0, 0, 0, 0));
    const todayEnd = new Date(now.setHours(23, 59, 59, 999));

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

    // Find all LCOs under this reseller
    const lcos = await Lco.find({ retailerId: resellerId }).select("_id lcoName").lean();

    if (!lcos.length) {
        return successResponse(res, "No LCOs found for this reseller", { result: [] });
    }

    const lcoIds = lcos.map((l) => l._id);

    // Find all ACTIVE users created for these LCOs
    const users = await User.find({
        "generalInformation.createdFor.type": "Lco",
        "generalInformation.createdFor.id": { $in: lcoIds },
        status: "active",
    })
        .select("_id updatedAt generalInformation.createdFor.id")
        .lean();

    // Prepare count object
    const lcoWiseData = {};

    users.forEach((user) => {
        const lcoId = user.generalInformation?.createdFor?.id?.toString();
        if (!lcoId) return;

        if (!lcoWiseData[lcoId]) {
            lcoWiseData[lcoId] = {
                totalActiveUser: 0,
                todayActiveUser: 0,
                weeklyActiveUser: 0,
                monthlyActiveUser: 0,
            };
        }

        const updatedAt = new Date(user.updatedAt);
        lcoWiseData[lcoId].totalActiveUser += 1;

        if (updatedAt >= todayStart && updatedAt <= todayEnd)
            lcoWiseData[lcoId].todayActiveUser += 1;

        if (updatedAt >= weekStart && updatedAt <= weekEnd)
            lcoWiseData[lcoId].weeklyActiveUser += 1;

        if (updatedAt >= monthStart && updatedAt <= monthEnd)
            lcoWiseData[lcoId].monthlyActiveUser += 1;
    });

    // Combine LCOs with counts
    const result = lcos.map((lco) => {
        const stats = lcoWiseData[lco._id.toString()] || {
            totalActiveUser: 0,
            todayActiveUser: 0,
            weeklyActiveUser: 0,
            monthlyActiveUser: 0,
        };
        return {
            lcoId: lco._id,
            lcoName: lco.lcoName,
            ...stats,
        };
    });

    return successResponse(res, "LCO-wise active user count fetched successfully", { result });
});
