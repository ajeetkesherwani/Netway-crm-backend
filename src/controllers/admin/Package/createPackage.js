// const mongoose = require("mongoose");
// const Package = require("../../../models/package");
// const catchAsync = require("../../../utils/catchAsync");
// const AppError = require("../../../utils/AppError");
// const { successResponse } = require("../../../utils/responseHandler");

// exports.createPackage = catchAsync(async (req, res, next) => {
//   const {
//     name,
//     validity, // { number: Number, unit: String }
//     sacCode,
//     fromDate,
//     toDate,
//     status,
//     typeOfPlan,
//     categoryOfPlan,
//     description,
//     basePrice,
//     offerPrice,
//     packageAvailable = false,
//     offerPackage = false,

//     // Bundle fields
//     isOtt = false,
//     ottType,
//     ottPackageId,

//     isIptv = false,
//     iptvType,
//     iptvPackageId,
//   } = req.body;

//   // ✅ Basic required field validation
//   if (!name || !status || !validity?.number || !validity?.unit || !categoryOfPlan) {
//     return next(
//       new AppError(
//         "Required fields missing: name, status, validity (number + unit), categoryOfPlan",
//         400
//       )
//     );
//   }

//   // ✅ Prevent duplicate package by name + typeOfPlan
//   const existing = await Package.findOne({ name, typeOfPlan });
//   if (existing) {
//     return next(
//       new AppError("A package with the same name and type already exists.", 409)
//     );
//   }

//   // ✅ Helper to validate ObjectId
//   const isValidObjectId = (id) => id && mongoose.Types.ObjectId.isValid(id);

//   // ✅ Validate OTT bundle
//   if (isOtt) {
//     if (!ottType) {
//       return next(new AppError("OTT Type is required when bundling with OTT", 400));
//     }
//     if (!ottPackageId || !isValidObjectId(ottPackageId)) {
//       return next(
//         new AppError("A valid OTT Package must be selected when bundling with OTT", 400)
//       );
//     }
//   }

//   // ✅ Validate IPTV bundle
//   if (isIptv) {
//     if (!iptvType) {
//       return next(new AppError("IPTV Type is required when bundling with IPTV", 400));
//     }
//     if (!iptvPackageId || !isValidObjectId(iptvPackageId)) {
//       return next(
//         new AppError("A valid IPTV Package must be selected when bundling with IPTV", 400)
//       );
//     }
//   }


//   // ✅ Build payload safely
//   const packageData = {
//     name,
//     validity: {
//       number: Number(validity.number),
//       unit: validity.unit,
//     },
//     sacCode: sacCode || undefined,
//     fromDate: fromDate ? new Date(fromDate) : undefined,
//     toDate: toDate ? new Date(toDate) : undefined,
//     status,
//     typeOfPlan: typeOfPlan || "Renew",
//     categoryOfPlan,
//     description: description || undefined,
//     basePrice: basePrice ? Number(basePrice) : undefined,
//     offerPrice: offerPrice ? Number(offerPrice) : undefined,
//     packageAvailable: Boolean(packageAvailable),
//     offerPackage: Boolean(offerPackage),
//   };

//   // Add OTT bundle only if enabled and valid
//   if (isOtt) {
//     packageData.isOtt = true;
//     packageData.ottType = ottType;
//     packageData.ottPackageId = ottPackageId; // Already validated as valid ObjectId
//   }

//   // Add IPTV bundle only if enabled and valid
//   if (isIptv) {
//     packageData.isIptv = true;
//     packageData.iptvType = iptvType;
//     packageData.iptvPackageId = iptvPackageId; // Already validated
//   }

//   // ✅ Create the package
//   const newPackage = await Package.create(packageData);

//   return successResponse(res, "Package created successfully", newPackage);
// });

const axios = require("axios");
const Package = require("../../../models/package");
const catchAsync = require("../../../utils/catchAsync");
const AppError = require("../../../utils/AppError");
const { successResponse } = require("../../../utils/responseHandler");
require("dotenv").config();

exports.createPackage = catchAsync(async (req, res, next) => {
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
    packageAvailable = false,
    offerPackage = false,

    isOtt = false,
    ottType,
    ottPackageId,

    isIptv = false,
    iptvType,
    iptvPackageId,
  } = req.body;

  /* -------------------- BASIC VALIDATION -------------------- */
  if (!name || !status || !validity?.number || !validity?.unit || !categoryOfPlan) {
    return next(
      new AppError(
        "Required fields missing: name, status, validity, categoryOfPlan",
        400
      )
    );
  }

  const existing = await Package.findOne({ name, typeOfPlan });
  if (existing) {
    return next(new AppError("Package already exists", 409));
  }

/* -------------------- IPTV LOGIC -------------------- */
let iptvPackageData = null;

if (isIptv) {
  if (!iptvType) {
    return next(new AppError("IPTV Type is required", 400));
  }

  if (!iptvPackageId) {
    return next(new AppError("Please select an IPTV Package", 400));
  }

  try {
    // API
    const apiResponse = await axios.get(
      `${process.env.API_BASE_URL}/package/iptv-packages/list`,
      { timeout: 3000 }
    );

    const packages = apiResponse.data?.data?.packages;
    console.log("package", packages);
    if (!Array.isArray(packages)) {
      return next(new AppError("Invalid IPTV package response", 500));
    }

    // ✅ FIND SELECTED PLAN
    const selectedPlan = packages.find(
      plan => String(plan.plan_Id) === String(iptvPackageId)
    );

    if (!selectedPlan) {
      return next(new AppError("Selected IPTV plan not found", 404));
    }

    // ✅ MAP TO PACKAGE SCHEMA
    iptvPackageData = {
      plan_id: selectedPlan.plan_Id,
      plan_code: selectedPlan.plan_code,
      plan_name: selectedPlan.plan_name,
      plan_type: selectedPlan.plan_type,
      plan_cat: selectedPlan.plan_cat,
      plan_period: Number(selectedPlan.plan_period),
      customer_price: Number(selectedPlan.customer_price),
      lco_price: Number(selectedPlan.lco_price)
    };

  } catch (error) {
    console.error("Internal IPTV API error:", error.message);
    return next(new AppError("Could not fetch IPTV packages", 500));
  }
}


  /* -------------------- BUILD PACKAGE -------------------- */
  const packageData = {
    name: name.trim(),
    validity: {
      number: Number(validity.number),
      unit: validity.unit,
    },
    sacCode,
    fromDate,
    toDate,
    status,
    typeOfPlan: typeOfPlan || "Renew",
    categoryOfPlan,
    description,
    basePrice: basePrice ? Number(basePrice) : undefined,
    offerPrice: offerPrice ? Number(offerPrice) : undefined,
    packageAvailable: Boolean(packageAvailable),
    offerPackage: Boolean(offerPackage),
  };

  if (isOtt) {
    packageData.isOtt = true;
    packageData.ottType = ottType;
    packageData.ottPackageId = ottPackageId;
  }

  if (isIptv) {
    packageData.isIptv = true;
    packageData.iptvType = iptvType;
    packageData.iptvPackageId = iptvPackageData; 
  }

  const newPackage = await Package.create(packageData);

  return successResponse(res, "Package created successfully", newPackage);
});
