const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");
const PurchasedPlan = require("../../../models/purchasedPlan");
const Package = require("../../../models/package");

exports.getLatestPurchasedPlans = catchAsync(async (req, res, next) => {

    //  latest 5 purchased plans 
    const latestPlans = await PurchasedPlan.find({ status: "active" })
        .sort({ purchaseDate: -1 })
        .limit(5)
        .select("packageId purchaseDate status")
        .populate("packageId", "basePrice status")
        .lean();

    const result = latestPlans.map(plan => ({
        price: plan.packageId?.basePrice || null,
        status: plan.status || plan.packageId?.status || null,
        purchaseDate: plan.purchaseDate
    }));

    return successResponse(res, "Latest 5 purchased plans fetched successfully", result);

});

