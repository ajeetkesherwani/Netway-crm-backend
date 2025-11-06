const Package = require("../../../models/package");
const catchAsync = require("../../../utils/catchAsync");
const AppError = require("../../../utils/AppError");
const { successResponse } = require("../../../utils/responseHandler");

exports.updatePackage = catchAsync(async (req, res, next) => {
    const { packageId } = req.params;
    const {
        name,
        validity,   // { number: Number, unit: String }
        sacCode,
        fromDate,
        toDate,
        status,
        typeOfPlan,
        categoryOfPlan,
        description,
        isIptv,
        iptvPlanName,
        isOtt,
        ottPlanName,
    } = req.body;

    if (!packageId) {
        return next(new AppError("Package ID is required", 400));
    }

    const packageToUpdate = await Package.findById(packageId);
    if (!packageToUpdate) {
        return next(new AppError("Package not found", 404));
    }

    // Update fields only if provided
    if (name) packageToUpdate.name = name;
    if (validity) packageToUpdate.validity = validity;
    if (sacCode !== undefined) packageToUpdate.sacCode = sacCode;
    if (fromDate) packageToUpdate.fromDate = fromDate;
    if (toDate) packageToUpdate.toDate = toDate;
    if (status) packageToUpdate.status = status;
    if (typeOfPlan) packageToUpdate.typeOfPlan = typeOfPlan;
    if (categoryOfPlan) packageToUpdate.categoryOfPlan = categoryOfPlan;
    if (description !== undefined) packageToUpdate.description = description;
    if (isIptv !== undefined) packageToUpdate.isIptv = isIptv;
    if (iptvPlanName !== undefined) packageToUpdate.iptvPlanName = iptvPlanName;
    if (isOtt !== undefined) packageToUpdate.isOtt = isOtt;
    if (ottPlanName !== undefined) packageToUpdate.ottPlanName = ottPlanName;

    await packageToUpdate.save();

    successResponse(res, "Package updated successfully", packageToUpdate);
});
