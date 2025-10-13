const User = require("../../../models/user");
const PurchasedPlan = require("../../../models/purchasedPlan"); // adjust path
const catchAsync = require("../../../utils/catchAsync");
const AppError = require("../../../utils/AppError");
const { successResponse } = require("../../../utils/responseHandler");

exports.getRegisterUsersByFilter = catchAsync(async (req, res, next) => {
    const { role } = req.user;
    let { filter, month, year } = req.query;

    // Default filter is 'day'
    if (!filter) filter = "day";

    if ((filter === "week" || filter === "month" || filter === "day") && (!month || !year)) {
        return next(new AppError("Month and year are required for week/month/day filters", 400));
    }

    let matchQuery = {};

    // Restrict for Reseller/LCO, Admin sees all
    if (role === "Retailer" || role === "Lco") {
        const userId = req.user._id;
        matchQuery = {
            "generalInformation.createdFor.id": userId,
            "generalInformation.createdFor.type": role
        };
    }

    const selectedMonth = parseInt(month) - 1;
    const selectedYear = parseInt(year);

    const startDate = new Date(selectedYear, selectedMonth, 1);
    const endDate = new Date(selectedYear, selectedMonth + 1, 0, 23, 59, 59, 999);
    matchQuery.createdAt = { $gte: startDate, $lte: endDate };

    const pipeline = [
        { $match: matchQuery },
        {
            $addFields: {
                dayOfMonth: { $dayOfMonth: "$createdAt" },
                month: { $month: "$createdAt" },
                year: { $year: "$createdAt" },
                dateString: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }
            }
        },
        // Lookup PurchasedPlan
        {
            $lookup: {
                from: "purchasedplans",
                localField: "_id",
                foreignField: "userId",
                as: "purchasedPlan"
            }
        },
        { $unwind: { path: "$purchasedPlan", preserveNullAndEmptyArrays: true } },
        // Lookup who purchased
        {
            $lookup: {
                from: "users",
                localField: "purchasedPlan.purchasedById",
                foreignField: "_id",
                as: "purchasedBy"
            }
        },
        { $unwind: { path: "$purchasedBy", preserveNullAndEmptyArrays: true } }
    ];

    // Group by filter
    if (filter === "day") {
        pipeline.push({
            $group: {
                _id: "$dateString",
                count: { $sum: 1 },
                users: {
                    $push: {
                        name: "$generalInformation.name",
                        username: "$generalInformation.username",
                        email: "$generalInformation.email",
                        phone: "$generalInformation.phone",
                        status: "$status",
                        walletBalance: "$wallet.balance",
                        createdAt: "$createdAt",
                        plan: {
                            name: "$purchasedPlan.planName",
                            price: "$purchasedPlan.price",
                            createdAt: "$purchasedPlan.createdAt",
                            expiryAt: "$purchasedPlan.expiryAt",
                            purchasedBy: "$purchasedBy.generalInformation.name"
                        }
                    }
                }
            }
        });
    } else if (filter === "week") {
        pipeline.push({
            $addFields: {
                segment: {
                    $switch: {
                        branches: [
                            { case: { $lte: ["$dayOfMonth", 7] }, then: "1-7" },
                            { case: { $and: [{ $gt: ["$dayOfMonth", 7] }, { $lte: ["$dayOfMonth", 14] }] }, then: "8-14" },
                            { case: { $and: [{ $gt: ["$dayOfMonth", 14] }, { $lte: ["$dayOfMonth", 21] }] }, then: "15-21" },
                            { case: { $and: [{ $gt: ["$dayOfMonth", 21] }, { $lte: ["$dayOfMonth", 28] }] }, then: "22-28" },
                            { case: { $gt: ["$dayOfMonth", 28] }, then: "29-end" }
                        ],
                        default: "unknown"
                    }
                }
            }
        });
        pipeline.push({
            $group: {
                _id: "$segment",
                count: { $sum: 1 },
                users: {
                    $push: {
                        name: "$generalInformation.name",
                        username: "$generalInformation.username",
                        email: "$generalInformation.email",
                        phone: "$generalInformation.phone",
                        status: "$status",
                        walletBalance: "$wallet.balance",
                        createdAt: "$createdAt",
                        plan: {
                            name: "$purchasedPlan.planName",
                            price: "$purchasedPlan.price",
                            createdAt: "$purchasedPlan.createdAt",
                            expiryAt: "$purchasedPlan.expiryAt",
                            purchasedBy: "$purchasedBy.generalInformation.name"
                        }
                    }
                }
            }
        });
    } else if (filter === "month") {
        const yearStart = new Date(selectedYear, 0, 1);
        const yearEnd = new Date(selectedYear, 11, 31, 23, 59, 59, 999);
        matchQuery.createdAt = { $gte: yearStart, $lte: yearEnd };
        pipeline[0] = { $match: matchQuery };
        pipeline.push({
            $group: {
                _id: "$month",
                count: { $sum: 1 },
                users: {
                    $push: {
                        name: "$generalInformation.name",
                        username: "$generalInformation.username",
                        email: "$generalInformation.email",
                        phone: "$generalInformation.phone",
                        status: "$status",
                        walletBalance: "$wallet.balance",
                        createdAt: "$createdAt",
                        plan: {
                            name: "$purchasedPlan.planName",
                            price: "$purchasedPlan.price",
                            createdAt: "$purchasedPlan.createdAt",
                            expiryAt: "$purchasedPlan.expiryAt",
                            purchasedBy: "$purchasedBy.generalInformation.name"
                        }
                    }
                }
            }
        });
    } else {
        return next(new AppError("Invalid filter. Use day, week, or month.", 400));
    }

    pipeline.push({ $sort: { _id: 1 } });

    const result = await User.aggregate(pipeline);

    successResponse(res, "Register users retrieved successfully", {
        filter,
        data: result,
        totalSegments: result.length
    });
});
