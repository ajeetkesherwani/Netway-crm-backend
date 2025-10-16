const mongoose = require("mongoose");
const PurchasedPlan = require("../../../../models/purchasedPlan");
const AppError = require("../../../../utils/AppError");
const catchAsync = require("../../../../utils/catchAsync");
const User = require("../../../../models/user");
const { successResponse } = require("../../../../utils/responseHandler");

exports.changePlanExpiry = catchAsync(async (req, res, next) => {
    const { purchasedPlanId, newExpiryDate } = req.body;

    // Validation
    if (!purchasedPlanId || !newExpiryDate) {
        return next(new AppError("purchasedPlanId and newExpiryDate are required", 400));
    }

    if (!mongoose.Types.ObjectId.isValid(purchasedPlanId)) {
        return next(new AppError("Invalid purchasedPlanId", 400));
    }

    if (isNaN(new Date(newExpiryDate).getTime())) {
        return next(new AppError("Invalid date format", 400));
    }

    //Find plan
    const plan = await PurchasedPlan.findById(purchasedPlanId);
    if (!plan) return next(new AppError("Purchased plan not found", 404));
    console.log("plan", plan);

    // Find user who owns the plan
    const user = await User.findById(plan.userId);
    if (!user) return next(new AppError("User not found for this plan", 404));
    console.log(user, "user");


    //  Update expiry date
    const oldExpiryDate = plan.expiryDate;
    plan.expiryDate = new Date(newExpiryDate);
    await plan.save();

    successResponse(res, "plan expiry date updated successfully", {
        purchasedPlanId: plan._id,
        planName: plan.packageId,
        oldExpiryDate: oldExpiryDate,
        newExpiryDate: plan.expiryDate
    });
});
