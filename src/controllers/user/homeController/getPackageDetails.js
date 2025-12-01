const Package = require("../../../models/package");
const PriceBook = require("../../../models/priceBook");
const User = require("../../../models/user");
const catchAsync = require("../../../utils/catchAsync");
const AppError = require("../../../utils/AppError");
const { successResponse } = require("../../../utils/responseHandler");
const mongoose = require("mongoose");

exports.getPackageDetails = catchAsync(async (req, res, next) => {

    const userId = req.user._id;
    const { packageId } = req.params;
    console.log(userId, "details page user");

    // Find logged-in user
    const user = await User.findById(userId).lean();
    if (!user) return next(new AppError("User not found", 404));

    let finalPackage = null;

    //  ADMIN CONDITION — Direct Package Model se leke aao
    if (user.generalInformation.createdFor.type == 'Admin') {

        finalPackage = await Package.findById( packageId)
            .select(
                "name validity basePrice offerPrice typeOfPlan categoryOfPlan description isOtt isIptv ottPlanName iptvPlanName"
            )
            .lean();

        if (!finalPackage) {
            return next(new AppError("Package not found", 404));
        }
        console.log("finalPackage", finalPackage);

        // Prepare details response for Admin
        const packageDetails = {
            id: finalPackage._id,
            planName: finalPackage.name,
            price: finalPackage.offerPrice || finalPackage.basePrice,
            validity: finalPackage.validity,
            billingType: finalPackage.typeOfPlan,
            category: finalPackage.categoryOfPlan,
            description: finalPackage.description,
            isOtt: finalPackage.isOtt,
            isIptv: finalPackage.isIptv
        };

        return successResponse(res, 200, {
            message: "Package details fetched successfully",
            packageDetails,
        });
    }

    // NON-ADMIN CONDITION (Retailer / LCO) — PriceBook ke andar se search karna
    const priceBook = await PriceBook.findOne({
        "package.packageId":new mongoose.Types.ObjectId(packageId)
    }).lean();

    if (!priceBook) {
        return next(new AppError("Package not assigned to this user", 404));
    }

    // PriceBook ke andar se selected package fetch karo
    const matchedPackage = priceBook.package.find(
        (pkg) => pkg.packageId.toString() === packageId
    );

    if (!matchedPackage) {
        return next(new AppError("Package details not found", 404));
    }

    // Prepare details response for Retailer / LCO
    const packageDetails = {
        id: matchedPackage.packageId,
        planName: matchedPackage.name,
        price: matchedPackage.retailerPrice || matchedPackage.lcoPrice,
        validity: matchedPackage.validity,
        billingType: matchedPackage.typeOfPlan,
        category: matchedPackage.categoryOfPlan,
        description: matchedPackage.description,
        isOtt: matchedPackage.isOtt,
        isIptv: matchedPackage.isIptv
    };

    return successResponse(res, 200, {
        message: "Package details fetched successfully",
        packageDetails,
    });
});
