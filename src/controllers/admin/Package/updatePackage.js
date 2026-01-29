// const mongoose = require("mongoose");
// const axios = require("axios");
// const Package = require("../../../models/package");
// const catchAsync = require("../../../utils/catchAsync");
// const AppError = require("../../../utils/AppError");
// const CreateLog = require("../../../utils/createLog");
// const { successResponse } = require("../../../utils/responseHandler");

// exports.updatePackage = catchAsync(async (req, res, next) => {
//   const { packageId } = req.params;

//   if (!packageId) {
//     return next(new AppError("Package ID is required", 400));
//   }

//   const packageToUpdate = await Package.findById(packageId);
//   if (!packageToUpdate) {
//     return next(new AppError("Package not found", 404));
//   }

//   const {
//     name,
//     validity,
//     sacCode,
//     fromDate,
//     toDate,
//     status,
//     typeOfPlan,
//     categoryOfPlan,
//     description,
//     basePrice,
//     offerPrice,
//     packageAvailable,
//     offerPackage,

//     // Bundle fields
//     isOtt = false,
//     ottType,
//     ottPackageId,

//     isIptv = false,
//     iptvType,
//     iptvPackageId
//   } = req.body;

//   /* -------------------- OTT VALIDATION -------------------- */
//   if (isOtt) {
//     if (!ottType) {
//       return next(new AppError("OTT Type is required when bundling with OTT", 400));
//     }
//     if (!ottPackageId || !mongoose.Types.ObjectId.isValid(ottPackageId)) {
//       return next(new AppError("A valid OTT Package must be selected", 400));
//     }
//   }

//   /* -------------------- IPTV LOGIC (SAME AS CREATE) -------------------- */
//   let iptvPackageData = null;

//   if (isIptv) {
//     if (!iptvType) {
//       return next(new AppError("IPTV Type is required when bundling with IPTV", 400));
//     }

//     if (!iptvPackageId) {
//       return next(new AppError("Please select an IPTV Package", 400));
//     }

//     try {
//       const apiResponse = await axios.get(
//         "http://localhost:5004/api/admin/package/iptv-packages/list",
//         { timeout: 5000 }
//       );

//       const packages = apiResponse.data?.data?.packages;

//       if (!Array.isArray(packages)) {
//         return next(new AppError("Invalid IPTV package response", 500));
//       }

//       const selectedPlan = packages.find(
//         plan => String(plan.plan_Id) === String(iptvPackageId)
//       );

//       if (!selectedPlan) {
//         return next(new AppError("Selected IPTV plan not found", 404));
//       }

//       iptvPackageData = {
//         plan_id: selectedPlan.plan_Id,
//         plan_code: selectedPlan.plan_code,
//         plan_name: selectedPlan.plan_name,
//         plan_type: selectedPlan.plan_type,
//         plan_cat: selectedPlan.plan_cat,
//         plan_period: Number(selectedPlan.plan_period),
//         customer_price: Number(selectedPlan.customer_price),
//         lco_price: Number(selectedPlan.lco_price)
//       };

//     } catch (error) {
//       console.error("IPTV UPDATE error:", error.message);
//       return next(new AppError("Could not fetch IPTV packages", 500));
//     }
//   }

//   /* -------------------- UPDATE BASIC FIELDS -------------------- */
//   if (name) packageToUpdate.name = name.trim();

//   if (validity) {
//     packageToUpdate.validity = {
//       number: Number(validity.number),
//       unit: validity.unit
//     };
//   }

//   if (sacCode !== undefined) packageToUpdate.sacCode = sacCode;
//   if (fromDate) packageToUpdate.fromDate = new Date(fromDate);
//   if (toDate) packageToUpdate.toDate = new Date(toDate);
//   if (status) packageToUpdate.status = status;
//   if (typeOfPlan) packageToUpdate.typeOfPlan = typeOfPlan;
//   if (categoryOfPlan) packageToUpdate.categoryOfPlan = categoryOfPlan;
//   if (description !== undefined) packageToUpdate.description = description;
//   if (basePrice !== undefined) packageToUpdate.basePrice = Number(basePrice);
//   if (offerPrice !== undefined) packageToUpdate.offerPrice = Number(offerPrice);

//   if (packageAvailable !== undefined) {
//     packageToUpdate.packageAvailable = Boolean(packageAvailable);
//   }

//   if (offerPackage !== undefined) {
//     packageToUpdate.offerPackage = Boolean(offerPackage);
//   }

//   /* -------------------- OTT BUNDLE -------------------- */
//   packageToUpdate.isOtt = Boolean(isOtt);

//   if (isOtt) {
//     packageToUpdate.ottType = ottType;
//     packageToUpdate.ottPackageId = ottPackageId;
//   } else {
//     packageToUpdate.ottType = undefined;
//     packageToUpdate.ottPackageId = undefined;
//   }

//   /* -------------------- IPTV BUNDLE -------------------- */
//   packageToUpdate.isIptv = Boolean(isIptv);

//   if (isIptv) {
//     packageToUpdate.iptvType = iptvType;
//     packageToUpdate.iptvPackageId = iptvPackageData; // ✅ FULL SNAPSHOT
//   } else {
//     packageToUpdate.iptvType = undefined;
//     packageToUpdate.iptvPackageId = undefined;
//   }

//   /* -------------------- SAVE -------------------- */
//   await packageToUpdate.save();

//   /* -------------------- ACTIVITY LOG -------------------- */
//   let packageDetails = `
// Package Name: ${packageToUpdate.name}
// Validity: ${packageToUpdate.validity?.number || '-'} ${packageToUpdate.validity?.unit || ''}
// SAC Code: ${packageToUpdate.sacCode || '-'}
// Base Price: ${packageToUpdate.basePrice || 0}
// Offer Price: ${packageToUpdate.offerPrice || 0}
// Type: ${packageToUpdate.typeOfPlan || '-'}
// Category: ${packageToUpdate.categoryOfPlan || '-'}
// Status: ${packageToUpdate.status || '-'}
// Package Available: ${packageToUpdate.packageAvailable ? 'Yes' : 'No'}
// Offer Package: ${packageToUpdate.offerPackage ? 'Yes' : 'No'}
// OTT Bundle: ${packageToUpdate.isOtt ? `${packageToUpdate.ottType} (${packageToUpdate.ottPackageId})` : 'No'}
// IPTV Bundle: ${
//   packageToUpdate.isIptv
//     ? `${packageToUpdate.iptvType} (${packageToUpdate.iptvPackageId?.plan_name})`
//     : 'No'
// }
// Description: ${packageToUpdate.description || '-'}
//   `.trim();

//   packageDetails = packageDetails.replace(/\n/g, ", ");

//   await CreateLog({
//     createdById: req.user._id,
//     createdByRole: req.user.role,
//     action: "Update Package successfully",
//     description: packageDetails
//   });

//   return successResponse(res, "Package updated successfully", packageToUpdate);
// });

const mongoose = require("mongoose");
const axios = require("axios");
const Package = require("../../../models/package");
const Setting = require("../../../models/setting");
const catchAsync = require("../../../utils/catchAsync");
const AppError = require("../../../utils/AppError");
const CreateLog = require("../../../utils/createLog");
const { successResponse } = require("../../../utils/responseHandler");

exports.updatePackage = catchAsync(async (req, res, next) => {
  console.log("===== UPDATE PACKAGE START =====");
  console.log("REQ PARAMS:", req.params);
  console.log("REQ BODY:", req.body);
  console.log("AUTH HEADER:", req.headers.authorization);

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

    isOtt = false,
    ottType,
    ottPackageId,

    isIptv = false,
    iptvType,
    iptvPackageId
  } = req.body;

  /* ================= IPTV DROPDOWN (SAME AS CREATE) ================= */
  let iptvPackageData = null;

  if (isIptv) {
    console.log("----- IPTV UPDATE FLOW -----");

    if (!req.headers.authorization) {
      return next(new AppError("Admin token missing for IPTV", 401));
    }

    try {
      const iptvResponse = await axios.get(
        "http://159.89.146.245:5004/api/admin/package/iptv-packages/list",
        {
          timeout: 15000,
          headers: {
            Authorization: req.headers.authorization,
            "Content-Type": "application/json",
          },
        }
      );

      console.log(
        "IPTV LIST RESPONSE:",
        JSON.stringify(iptvResponse.data, null, 2)
      );

      const packages = iptvResponse?.data?.data?.packages;

      if (!Array.isArray(packages)) {
        return next(new AppError("Invalid IPTV package list", 500));
      }

      const selectedPlan = packages.find(
        (p) => String(p.plan_Id) === String(iptvPackageId)
      );

      if (!selectedPlan) {
        return next(new AppError("Selected IPTV plan not found", 404));
      }

      iptvPackageData = {
        plan_id: selectedPlan.plan_Id,
        plan_code: selectedPlan.plan_code,
        plan_name: selectedPlan.plan_name,
        plan_type: selectedPlan.plan_type,
        plan_cat: selectedPlan.plan_cat,
        plan_period: selectedPlan.plan_period,
        customer_price: selectedPlan.customer_price,
        lco_price: selectedPlan.lco_price,
      };

      console.log("Final IPTV Snapshot:", iptvPackageData);
    } catch (error) {
      console.error("🔥 IPTV UPDATE ERROR:", error.message);
      console.error("🔥 IPTV STATUS:", error?.response?.status);
      console.error("🔥 IPTV DATA:", error?.response?.data);
      return next(new AppError("Could not fetch IPTV packages", 500));
    }
  }

  /* ================= OTT DROPDOWN (SAME AS CREATE) ================= */
  let ottPackageData = null;

  if (isOtt) {
    console.log("----- OTT UPDATE FLOW -----");

    try {
      const setting = await Setting.findOne();
      if (!setting?.playBoxToken) {
        return next(new AppError("OTT token missing", 401));
      }

      const ottResponse = await axios.get(
        "http://159.89.146.245:5004/api/admin/package/ott-package/list",
        {
          timeout: 15000,
          headers: {
            "x-api-key": "2ZsafDI6OV2IH5m18pqtS9k2C6Onnq5D82FcNsRh",
            Authorization: `Bearer ${setting.playBoxToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log(
        "OTT LIST RESPONSE:",
        JSON.stringify(ottResponse.data, null, 2)
      );

      const packages = ottResponse?.data?.data;

      if (!Array.isArray(packages)) {
        return next(new AppError("Invalid OTT package list", 500));
      }

      const selectedOtt = packages.find(
        (p) => String(p.packId) === String(ottPackageId)
      );

      if (!selectedOtt) {
        return next(new AppError("Selected OTT package not found", 404));
      }

      ottPackageData = selectedOtt;
      console.log("Final OTT Snapshot:", ottPackageData);
    } catch (error) {
      console.error("🔥 OTT UPDATE ERROR:", error.message);
      console.error("🔥 OTT STATUS:", error?.response?.status);
      console.error("🔥 OTT DATA:", error?.response?.data);
      return next(new AppError("Could not fetch OTT packages", 500));
    }
  }

  /* ================= BASIC FIELD UPDATES ================= */
  if (name) packageToUpdate.name = name.trim();
  if (validity) {
    packageToUpdate.validity = {
      number: Number(validity.number),
      unit: validity.unit,
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
  if (packageAvailable !== undefined)
    packageToUpdate.packageAvailable = Boolean(packageAvailable);
  if (offerPackage !== undefined)
    packageToUpdate.offerPackage = Boolean(offerPackage);

  /* ================= OTT BUNDLE ================= */
  packageToUpdate.isOtt = Boolean(isOtt);
  if (isOtt) {
    packageToUpdate.ottType = ottType;
    packageToUpdate.ottPackageId = ottPackageData;
  } else {
    packageToUpdate.ottType = undefined;
    packageToUpdate.ottPackageId = undefined;
  }

  /* ================= IPTV BUNDLE ================= */
  packageToUpdate.isIptv = Boolean(isIptv);
  if (isIptv) {
    packageToUpdate.iptvType = iptvType;
    packageToUpdate.iptvPackageId = iptvPackageData;
  } else {
    packageToUpdate.iptvType = undefined;
    packageToUpdate.iptvPackageId = undefined;
  }

  /* ================= SAVE ================= */
  await packageToUpdate.save();

  /* ================= LOG ================= */
  await CreateLog({
    createdById: req.user._id,
    createdByRole: req.user.role,
    action: "Update Package successfully",
    description: `Updated package ${packageToUpdate.name}`,
  });

  console.log("===== UPDATE PACKAGE SUCCESS =====");

  return successResponse(res, "Package updated successfully", packageToUpdate);
});

