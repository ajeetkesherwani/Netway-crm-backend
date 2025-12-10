const Package = require("../../../models/package");
const catchAsync = require("../../../utils/catchAsync");
const AppError = require("../../../utils/AppError");
const { successResponse } = require("../../../utils/responseHandler");

exports.createPackage = catchAsync(async (req, res, next) => {
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
        basePrice,
        offerPrice
    } = req.body;

    // ✅ Basic validation
    if (!name || !status || !validity?.number || !validity?.unit || !categoryOfPlan) {
        return next(new AppError("Required fields: name, status, validity(number + unit), categoryOfPlan", 400));
    }

    // ✅ Optional: Prevent duplicates (based on name & typeOfPlan)
    const existing = await Package.findOne({ name, typeOfPlan });
    if (existing) {
        return next(new AppError("A package with the same name and typeOfPlan already exists.", 409));
    }

    // ✅ Create the package
    const newPackage = await Package.create({
        name,
        validity,
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
         basePrice,
        offerPrice
    });

    successResponse(res, "Package created successfully", newPackage);
});

