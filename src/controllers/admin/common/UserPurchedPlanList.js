const mongoose = require("mongoose");
const catchAsync = require("../../../utils/catchAsync");
const AppError = require("../../../utils/AppError");
const { successResponse } = require("../../../utils/responseHandler");
const PurchasedPlan = require("../../../models/purchasedPlan");

exports.getUserPurchasedPlans = catchAsync(async (req, res, next) => {
    const { userId, type } = req.query;

    // ---------------- Build Type Filter ---------------- //
    let matchCondition = {};
    let invalidFilter = null;

    if (type) {
        switch (type.toLowerCase()) {
            case "iptv":
                matchCondition = { "package.isIptv": true };
                break;

            case "ott":
                matchCondition = { "package.isOtt": true };
                break;

            case "both":
                matchCondition = { "package.isIptv": true, "package.isOtt": true };
                break;

            case "internet":
                matchCondition = {
                    "package.isIptv": { $ne: true },
                    "package.isOtt": { $ne: true },
                };
                break;

            default:
                invalidFilter = type; // store invalid filter
                matchCondition = {}; // keep empty so no crash
        }
    }

    // ---------------- Build Aggregation Pipeline ---------------- //
    const pipeline = [];

    // filter by user if userId provided
    if (userId) {
        try {
            pipeline.push({ $match: { userId: new mongoose.Types.ObjectId(userId) } });
        } catch {
            return next(new AppError("Invalid userId format", 400));
        }
    }

    // Lookup user details (populate user)
    pipeline.push({
        $lookup: {
            from: "users", // collection name in MongoDB
            localField: "userId",
            foreignField: "_id",
            as: "user",
        },
    });
    pipeline.push({ $unwind: "$user" }); // make it a single object instead of array

    // Lookup package details
    pipeline.push({
        $lookup: {
            from: "packages",
            localField: "packageId",
            foreignField: "_id",
            as: "package",
        },
    });

    pipeline.push({ $unwind: "$package" });

    //  Apply flexible type-based filter (if provided)
    if (Object.keys(matchCondition).length > 0) {
        pipeline.push({ $match: matchCondition });
    }

    // Select only required fields
    pipeline.push({
        $project: {
            _id: 1,
            userId: 1,
            "user.name": 1,
            "user.username": 1,
            packageId: 1,
            purchaseDate: 1,
            startDate: 1,
            expiryDate: 1,
            "user.generalInformation.name": 1,
            "user.generalInformation.username": 1,
            "user.generalInformation.email": 1,
            "user.generalInformation.phone": 1,
            "user.generalInformation.state": 1,
            "user.status": 1,
            // amountPaid: 1,
            // status: 1,
            // paymentMethod: 1,
            // isPaymentRecived: 1,
            "package.name": 1,
            "package.basePrice": 1,
            // "package.offerPrice": 1,
            "package.isIptv": 1,
            "package.isOtt": 1,
            "package.ottPlanName": 1,
            "package.iptvPlanName": 1,
            // "package.categoryOfPlan": 1,
            // "package.description": 1,
        },
    });

    // ---------------- Execute Aggregation ---------------- //
    const userPlans = await PurchasedPlan.aggregate(pipeline);

    if (invalidFilter) {
        return successResponse(res, {
            message: `Invalid filter type: "${invalidFilter}". Allowed values are: iptv, ott, both, internet.`,
            usedFilter: invalidFilter,
            data: [],
        });
    }

    return successResponse(
        res,
        userPlans.length
            ? "Purchased plans fetched successfully"
            : "No purchased plans found",
        userPlans
    );
});
