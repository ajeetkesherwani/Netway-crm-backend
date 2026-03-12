const AssignPackage = require("../../../models/assignPackage");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");

exports.getAssignedPackagesByAssignToId = catchAsync(async (req, res, next) => {
    const { assignToId } = req.params;

    if (!assignToId) {
        return next(new AppError("assignToId is required", 400));
    }

    const assignment = await AssignPackage.findOne({ assignToId })


    if (!assignment) {
        return successResponse(res, "No package assignments found for this ID", []);
    }

    return successResponse(res, "Assigned packages fetched successfully", assignment);
});
