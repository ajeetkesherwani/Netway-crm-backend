// const Package = require("../../../models/package");
// const catchAsync = require("../../../utils/catchAsync");
// const AppError = require("../../../utils/AppError");
// const { successResponse } = require("../../../utils/responseHandler");

// exports.createPackage = catchAsync(async (req, res, next) => {
//     const {
//         name,
//         validity,   // { number: Number, unit: String }
//         sacCode,
//         fromDate,
//         toDate,
//         status,
//         typeOfPlan,
//         categoryOfPlan,
//         description,
//         // isIptv,
//         // iptvPlanName,
//         // isOtt,
//         // ottPlanName,
//         basePrice,
//         offerPrice,
//             packageAvailable,
//         offerPackage,

//         isOtt,
//         ottType,
//         ottPackageId,

//         isIptv,
//         iptvType,
//         iptvPackageId
//     } = req.body;

//     // ✅ Basic validation
//     if (!name || !status || !validity?.number || !validity?.unit || !categoryOfPlan) {
//         return next(new AppError("Required fields: name, status, validity(number + unit), categoryOfPlan", 400));
//     }

//     // ✅ Optional: Prevent duplicates (based on name & typeOfPlan)
//     const existing = await Package.findOne({ name, typeOfPlan });
//     if (existing) {
//         return next(new AppError("A package with the same name and typeOfPlan already exists.", 409));
//     }

//     // ✅ Create the package
//     const newPackage = await Package.create({
//         name,
//         validity,
//         sacCode,
//         fromDate,
//         toDate,
//         status,
//         typeOfPlan,
//         categoryOfPlan,
//         description,
//         // isIptv,
//         // iptvPlanName,
//         // isOtt,
//         // ottPlanName,
//          basePrice,
//         offerPrice,
//          packageAvailable,
//         offerPackage,

//         isOtt,
//         ottType,
//         ottPackageId,

//         isIptv,
//         iptvType,
//         iptvPackageId
//     });

//     successResponse(res, "Package created successfully", newPackage);
// });

const mongoose = require("mongoose");
const Package = require("../../../models/package");
const catchAsync = require("../../../utils/catchAsync");
const AppError = require("../../../utils/AppError");
const { successResponse } = require("../../../utils/responseHandler");

exports.createPackage = catchAsync(async (req, res, next) => {
  const {
    name,
    validity, // { number: Number, unit: String }
    sacCode,
    fromDate,
    toDate,
    status,
    typeOfPlan,
    categoryOfPlan,
    description,
    basePrice,
    offerPrice,
    packageAvailable = false,
    offerPackage = false,

    // Bundle fields
    isOtt = false,
    ottType,
    ottPackageId,

    isIptv = false,
    iptvType,
    iptvPackageId,
  } = req.body;

  // ✅ Basic required field validation
  if (!name || !status || !validity?.number || !validity?.unit || !categoryOfPlan) {
    return next(
      new AppError(
        "Required fields missing: name, status, validity (number + unit), categoryOfPlan",
        400
      )
    );
  }

  // ✅ Prevent duplicate package by name + typeOfPlan
  const existing = await Package.findOne({ name, typeOfPlan });
  if (existing) {
    return next(
      new AppError("A package with the same name and type already exists.", 409)
    );
  }

  // ✅ Helper to validate ObjectId
  const isValidObjectId = (id) => id && mongoose.Types.ObjectId.isValid(id);

  // ✅ Validate OTT bundle
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

  // ✅ Validate IPTV bundle
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

  // ✅ Build payload safely
  const packageData = {
    name,
    validity: {
      number: Number(validity.number),
      unit: validity.unit,
    },
    sacCode: sacCode || undefined,
    fromDate: fromDate ? new Date(fromDate) : undefined,
    toDate: toDate ? new Date(toDate) : undefined,
    status,
    typeOfPlan: typeOfPlan || "Renew",
    categoryOfPlan,
    description: description || undefined,
    basePrice: basePrice ? Number(basePrice) : undefined,
    offerPrice: offerPrice ? Number(offerPrice) : undefined,
    packageAvailable: Boolean(packageAvailable),
    offerPackage: Boolean(offerPackage),
  };

  // Add OTT bundle only if enabled and valid
  if (isOtt) {
    packageData.isOtt = true;
    packageData.ottType = ottType;
    packageData.ottPackageId = ottPackageId; // Already validated as valid ObjectId
  }

  // Add IPTV bundle only if enabled and valid
  if (isIptv) {
    packageData.isIptv = true;
    packageData.iptvType = iptvType;
    packageData.iptvPackageId = iptvPackageId; // Already validated
  }

  // ✅ Create the package
  const newPackage = await Package.create(packageData);

  return successResponse(res, "Package created successfully", newPackage);
});