const Package = require("../../../models/package");
const PurchasedPlan = require("../../../models/purchasedPlan");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");

exports.getPackages = catchAsync(async(req, res, next) => {
    
    const packages = await Package.find();
    if(!packages) return next(new AppError("packages not found",404));

    const packageWithUserCount = await Promise.all(packages.map(async (pkg) => {
        const totalUser = await PurchasedPlan.countDocuments({ packageId: pkg._id });
        return {
            ...pkg.toObject(),
            totalUser
        };
    }));

    successResponse(res, "Packages found successfully", packageWithUserCount);
});