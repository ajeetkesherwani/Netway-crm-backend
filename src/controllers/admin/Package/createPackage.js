const Package = require("../../../models/package");
const catchAsync = require("../../../utils/catchAsync");
const AppError = require("../../../utils/AppError");
const { successResponse } = require("../../../utils/responseHandler");

exports.createPackage = catchAsync(async (req, res, next) => {
    const userId = req.admin._id;

    const {
        name,
        description,
        type, // "OTT", "WiFi", "Combo"
        price,
        validityInDays,
        trialPeriodInDays,
        billingType,
        packageInfo,
        sortOrder,
        speed,
        isPackageForNewAccounts,
        isPackageIsOffer,
        isBundleWithOtt,
        bunddleOttType,
        bunddleOttPackageName,
        isIncludeBundleAmountWithPackage,
        isActive,
        isFeatured
    } = req.body;

    // ✅ Basic validation
    if (!name || !type || !price || !validityInDays) {
        return next(new AppError("Required fields: name, type, price, validityInDays", 400));
    }

    // ✅ Optional: Prevent duplicates (based on name & type)
    const existing = await Package.findOne({ name, type });
    if (existing) {
        return next(new AppError("A package with the same name and type already exists.", 409));
    }

    // ✅ Create the package
    const newPackage = await Package.create({
        name,
        description,
        type,
        price,
        validityInDays,
        trialPeriodInDays,
        billingType,
        packageInfo,
        sortOrder,
        speed,
        isPackageForNewAccounts,
        isPackageIsOffer,
        isBundleWithOtt,
        bunddleOttType,
        bunddleOttPackageName,
        isIncludeBundleAmountWithPackage,
        isActive,
        isFeatured,
        addedBy: userId
    });

    successResponse(res, "Package created successfully", newPackage);
});
