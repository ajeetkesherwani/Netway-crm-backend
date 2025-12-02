const UserPackage = require("../../../models/userPackage");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");
const AppError = require("../../../utils/AppError");

exports.deleteAssignedPackage = catchAsync(async (req, res, next) => {
    const packageId = req.params.packageId;

    const deletedPackage = await UserPackage.findByIdAndDelete(packageId);

    if (!deletedPackage) {
        return next(new AppError("Assigned package not found", 404));
    }

    return successResponse(res, "Assigned package deleted successfully", deletedPackage);
});


exports.deleteAssignedPackage = catchAsync(async (req, res, next) => {
    const packageId = req.params.packageId;

    const deletedPackage = await UserPackage.findByIdAndDelete(packageId);

    if (!deletedPackage) {
        return next(new AppError("Assigned package not found", 404));
    }

    return successResponse(res, "Assigned package deleted successfully", deletedPackage);
});
