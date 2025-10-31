const AssignPackage = require("../../../models/assignPackage");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");

exports.updateAssignPackageStatus = catchAsync(async (req, res, next) => {
    const { packageItemId } = req.params;
    const { status } = req.body;

    if (!packageItemId) return next(new AppError("packageItemId is required in params", 400));
    if (!status) return next(new AppError("status is required", 400));

    // Find the assignment containing this package
    const assignment = await AssignPackage.findOne({ "packages._id": packageItemId });
    if (!assignment) return next(new AppError("Assignment not found for this package item", 404));

    // Find the package and update status
    const pkg = assignment.packages.id(packageItemId);
    if (!pkg) return next(new AppError("Package not found", 404));

    pkg.status = status;

    await assignment.save();

    return successResponse(res, "Assign package status updated successfully", pkg);
});
