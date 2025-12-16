const mongoose = require("mongoose");
const Package = require("../../../models/package");
const catchAsync = require("../../../utils/catchAsync");
const AppError = require("../../../utils/AppError");
const CreateLog = require("../../../utils/createLog");
const { successResponse } = require("../../../utils/responseHandler");

exports.updatePackage = catchAsync(async (req, res, next) => {
    const { packageId } = req.params;

    if (!packageId) {
        return next(new AppError("Package ID is required", 400));
    }

    const packageToUpdate = await Package.findById(packageId);
    if (!packageToUpdate) {
        return next(new AppError("Package not found", 404));
    }

    const {
        name,
        validity,
        sacCode,
        fromDate,
        toDate,
        status,
        typeOfPlan,
        categoryOfPlan,
        description,
        basePrice,
        offerPrice,
        packageAvailable,
        offerPackage,

        // Bundle fields
        isOtt = false,
        ottType,
        ottPackageId,

        isIptv = false,
        iptvType,
        iptvPackageId,
    } = req.body;

    // Helper function to check ObjectId
    const isValidObjectId = (id) => id && mongoose.Types.ObjectId.isValid(id);

    // Validate OTT bundle
    if (isOtt) {
        if (!ottType) {
            return next(new AppError("OTT Type is required when bundling with OTT", 400));
        }
        if (!ottPackageId || !isValidObjectId(ottPackageId)) {
            return next(
                new AppError("A valid OTT Package must be selected when bundling with OTT", 400)
            );
        }
    }

    // Validate IPTV bundle
    if (isIptv) {
        if (!iptvType) {
            return next(new AppError("IPTV Type is required when bundling with IPTV", 400));
        }
        if (!iptvPackageId || !isValidObjectId(iptvPackageId)) {
            return next(
                new AppError("A valid IPTV Package must be selected when bundling with IPTV", 400)
            );
        }
    }

    // Update regular fields only if present
    if (name) packageToUpdate.name = name;

    if (validity) {
        packageToUpdate.validity = {
            number: Number(validity.number),
            unit: validity.unit
        };
    }

    if (sacCode !== undefined) packageToUpdate.sacCode = sacCode;
    if (fromDate) packageToUpdate.fromDate = new Date(fromDate);
    if (toDate) packageToUpdate.toDate = new Date(toDate);
    if (status) packageToUpdate.status = status;
    if (typeOfPlan) packageToUpdate.typeOfPlan = typeOfPlan;
    if (categoryOfPlan) packageToUpdate.categoryOfPlan = categoryOfPlan;
    if (description !== undefined) packageToUpdate.description = description;
    if (basePrice !== undefined) packageToUpdate.basePrice = Number(basePrice);
    if (offerPrice !== undefined) packageToUpdate.offerPrice = Number(offerPrice);

    if (packageAvailable !== undefined) packageToUpdate.packageAvailable = Boolean(packageAvailable);
    if (offerPackage !== undefined) packageToUpdate.offerPackage = Boolean(offerPackage);

    // --- OTT Bundle ---
    packageToUpdate.isOtt = Boolean(isOtt);
    if (isOtt) {
        packageToUpdate.ottType = ottType;
        packageToUpdate.ottPackageId = ottPackageId;
    } else {
        packageToUpdate.ottType = undefined;
        packageToUpdate.ottPackageId = undefined;
    }

    // --- IPTV Bundle ---
    packageToUpdate.isIptv = Boolean(isIptv);
    if (isIptv) {
        packageToUpdate.iptvType = iptvType;
        packageToUpdate.iptvPackageId = iptvPackageId;
    } else {
        packageToUpdate.iptvType = undefined;
        packageToUpdate.iptvPackageId = undefined;
    }

    // Save final updated model
    await packageToUpdate.save();

    // Build package details for the log
let packageDetails = `
Package Name: ${packageToUpdate.name}
Validity: ${packageToUpdate.validity?.number || '-'} ${packageToUpdate.validity?.unit || ''}
SAC Code: ${packageToUpdate.sacCode || '-'}
Base Price: ${packageToUpdate.basePrice || 0}
Offer Price: ${packageToUpdate.offerPrice || 0}
Type: ${packageToUpdate.typeOfPlan || '-'}
Category: ${packageToUpdate.categoryOfPlan || '-'}
Status: ${packageToUpdate.status || '-'}
Package Available: ${packageToUpdate.packageAvailable ? 'Yes' : 'No'}
Offer Package: ${packageToUpdate.offerPackage ? 'Yes' : 'No'}
OTT Bundle: ${packageToUpdate.isOtt ? `${packageToUpdate.ottType} (${packageToUpdate.ottPackageId})` : 'No'}
IPTV Bundle: ${packageToUpdate.isIptv ? `${packageToUpdate.iptvType} (${packageToUpdate.iptvPackageId})` : 'No'}
Description: ${packageToUpdate.description || '-'}`.trim();


// Replace newlines with commas
packageDetails = packageDetails.replace(/\n/g, ', ');

      // ✅ ACTIVITY LOG
    await CreateLog({
        createdById: req.user._id,
        createdByRole: req.user.role,
        action: "Update Package successfully",
        description: `${packageDetails}`
    });


    successResponse(res, "Package updated successfully", packageToUpdate);
});
