const Package = require("../../../models/package");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");

exports.deletePackage = catchAsync(async (req, res, next) => {

    const { packageId } = req.params;
    if (!packageId) return next(new AppError("packageId is required", 400));

    const package = await Package.findByIdAndDelete(packageId);
    if (!package) return next(new AppError("package not found", 404));

    successResponse(res, "package delete successfully", package);

});