const Package = require("../../../models/Package");
const User = require("../../../models/user");
const catchAsync = require("../../../utils/catchAsync");
const AppError = require("../../../utils/AppError");
const { successResponse } = require("../../../utils/responseHandler");  


exports.getPackageDetails = catchAsync(async (req, res, next) => {
    const { packageId } = req.params;
    const userId = req.user._id;

    const user = await User.findById(userId);

    if (!user) return next(new AppError("User not found", 404));

    const pkg = await Package.findById(packageId);

    if (!pkg) return next(new AppError("Package not found", 404));

    const createdFor = user.generalInformation?.createdFor;

    // SECURITY CHECK → USER ONLY SEE THEIR PACKAGES
    let isAllowed = false;

    if (createdFor.type === "Admin") isAllowed = true;

    else if (createdFor.type === "Retailer" &&
        pkg.createdBy.type === "Retailer" &&
        pkg.createdBy.id.toString() === createdFor.id.toString()) isAllowed = true;

    else if (createdFor.type === "Lco" &&
        pkg.createdBy.type === "Lco" &&
        pkg.createdBy.id.toString() === createdFor.id.toString()) isAllowed = true;

    else if (createdFor.type === "Self") {
        if (pkg._id.toString() === user.packageInfomation.packageId?.toString()) isAllowed = true;
        if (pkg.isPublic) isAllowed = true;
    }

    if (!isAllowed) return next(new AppError("You are not allowed to view this package", 403));

    return successResponse(res, {
        message: "Package details fetched successfully",
        package: pkg
    });
});
