const AssignPackage = require("../../../models/assignPackage");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");

exports.getAssignedPackageDetails = catchAsync(async (req, res, next) => {
    const { assignToId, packageId } = req.params;

    if (!assignToId || !packageId) {
        return next(new AppError("assignToId and packageId are required", 400));
    }

    const assignment = await AssignPackage.findOne({ assignToId })
        .populate({
            path: "packages.packageId",
            select: "name basePrice validity sacCode typeofPlan categoryOfPlan fromdate todate description status" 
        });

    if (!assignment) {
        return next(new AppError("No package assignments found for this reseller", 404));
    }

    const packageDetails = assignment.packages.find(
        p => p.packageId._id.toString() === packageId
    );

    if (!packageDetails) {
        return next(new AppError("This package is not assigned to the reseller", 404));
    }

    return successResponse(res, "Package details fetched successfully", packageDetails.packageId);
});
