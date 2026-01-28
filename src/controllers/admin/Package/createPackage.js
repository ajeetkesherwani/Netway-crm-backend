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
      "http://159.89.146.245:5004/api/admin/package/iptv-packages/list",
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

/* -------------------- OTT LOGIC -------------------- */
let ottPackageData = null;

if (isOtt) {
  if (!ottType) {
    return next(new AppError("OTT Type is required", 400));
  }

  if (!ottPackageId) {
    return next(new AppError("Please select an OTT Package", 400));
  }

  try {
    // Call your cleaned OTT API
    const apiResponse = await axios.get(
      "http://159.89.146.245:5004/api/admin/package/ott-package/list",
      { timeout: 5000 }
    );

    const packages = apiResponse.data?.data;

    if (!Array.isArray(packages)) {
      return next(new AppError("Invalid OTT package response", 500));
    }

    // ✅ FIND SELECTED OTT PACKAGE
    const selectedOtt = packages.find(
      pkg => String(pkg.packId) === String(ottPackageId)
    );

    if (!selectedOtt) {
      return next(new AppError("Selected OTT package not found", 404));
    }

    ottPackageData = {
      packId: selectedOtt.packId,
      name: selectedOtt.name,
      basePrice: selectedOtt.basePrice,
      marketPrice: selectedOtt.marketPrice,
      validity: selectedOtt.validity,
      ottProviders: selectedOtt.ottProviders
    };

  } catch (error) {
    console.error("OTT API error:", error.message);
    return next(new AppError("Could not fetch OTT packages", 500));
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
    packageData.ottPackageId = ottPackageData;
  }

  if (isIptv) {
    packageData.isIptv = true;
    packageData.iptvType = iptvType;
    packageData.iptvPackageId = iptvPackageData; 
  }

  const newPackage = await Package.create(packageData);

  return successResponse(res, "Package created successfully", newPackage);
});
