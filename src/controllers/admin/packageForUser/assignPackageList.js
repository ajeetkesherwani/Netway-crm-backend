const UserPackage = require("../../../models/userPackage");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");  

exports.assignPackageListByUserId = catchAsync(async (req, res, next) => {
    const userId = req.params.userId;   

    // Fetch all packages assigned to the user
    const assignedPackages = await UserPackage.find({ userId })
    .populate({
            path: 'packageId',
            // select: 'name validity basePrice offerPrice status typeOfPlan categoryOfPlan'
            select: 'name validity.number validity.unit basePrice offerPrice status typeOfPlan categoryOfPlan'
        })
        .lean(); 

    return successResponse(res, "Assigned packages fetched successfully", assignedPackages);
});