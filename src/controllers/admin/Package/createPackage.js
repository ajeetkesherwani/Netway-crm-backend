// const axios = require("axios");
// const Package = require("../../../models/package");
// const Setting = require("../../../models/setting");
// const catchAsync = require("../../../utils/catchAsync");
// const AppError = require("../../../utils/AppError");
// const { successResponse } = require("../../../utils/responseHandler");

// exports.createPackage = catchAsync(async (req, res, next) => {
//   console.log("===== CREATE PACKAGE START =====");
//   console.log("Request Body:", req.body);

//   const {
//     name,
//     validity,
//     status,
//     typeOfPlan,
//     categoryOfPlan,
//     description,
//     basePrice,
//     offerPrice,

//     isOtt = false,
//     ottType,
//     ottPackageId,

//     isIptv = false,
//     iptvType,
//     iptvPackageId,
//   } = req.body;

//   /* ---------------- BASIC VALIDATION ---------------- */
//   if (!name || !status || !validity?.number || !validity?.unit || !categoryOfPlan) {
//     console.log("❌ Validation failed");
//     return next(new AppError("Missing required fields", 400));
//   }

//   const existing = await Package.findOne({ name, typeOfPlan });
//   if (existing) {
//     console.log("❌ Package already exists");
//     return next(new AppError("Package already exists", 409));
//   }

//   /* ================= IPTV DROPDOWN LOGIC ================= */
//   let iptvPackageData = null;

//   if (isIptv) {
//     console.log("----- IPTV FLOW START -----");

//     try {
//       console.log("Calling IPTV LIST API...");

//       const iptvResponse = await axios.get(
//         "http://159.89.146.245:5004/api/admin/package/iptv-packages/list",
//         { timeout: 10000 }
//       );

//       console.log("IPTV FULL RESPONSE:", JSON.stringify(iptvResponse.data, null, 2));

//       const packages = iptvResponse?.data?.data?.packages;

//       console.log("Extracted IPTV packages:", packages);

//       if (!Array.isArray(packages)) {
//         console.log("❌ IPTV packages not array");
//         return next(new AppError("Invalid IPTV package list", 500));
//       }

//       const selectedPlan = packages.find(
//         p => String(p.plan_Id) === String(iptvPackageId)
//       );

//       console.log("Selected IPTV Plan:", selectedPlan);

//       if (!selectedPlan) {
//         return next(new AppError("Selected IPTV plan not found", 404));
//       }

//       iptvPackageData = {
//         plan_id: selectedPlan.plan_Id,
//         plan_code: selectedPlan.plan_code,
//         plan_name: selectedPlan.plan_name,
//         plan_type: selectedPlan.plan_type,
//         plan_cat: selectedPlan.plan_cat,
//         plan_period: selectedPlan.plan_period,
//         customer_price: selectedPlan.customer_price,
//         lco_price: selectedPlan.lco_price,
//       };

//       console.log("Final IPTV Data:", iptvPackageData);
//     } catch (error) {
//       console.error(" IPTV ERROR MESSAGE:", error.message);
//       console.error(" IPTV STATUS:", error?.response?.status);
//       console.error(" IPTV DATA:", error?.response?.data);
//       return next(new AppError("Could not fetch IPTV packages", 500));
//     }
//   }

//   /* ================= OTT DROPDOWN LOGIC ================= */
//   let ottPackageData = null;

//   if (isOtt) {
//     console.log("----- OTT FLOW START -----");

//     try {
//       const setting = await Setting.findOne();
//       console.log("OTT TOKEN FROM DB:", setting?.playBoxToken);

//       if (!setting?.playBoxToken) {
//         return next(new AppError("OTT token missing", 401));
//       }

//       console.log("Calling OTT LIST API...");

//       const ottResponse = await axios.get(
//         "http://159.89.146.245:5004/api/admin/package/ott-package/list",
//         {
//           timeout: 10000,
//           headers: {
//             "x-api-key": "2ZsafDI6OV2IH5m18pqtS9k2C6Onnq5D82FcNsRh",
//             Authorization: `Bearer ${setting.playBoxToken}`,
//             "Content-Type": "application/json",
//           },
//         }
//       );

//       console.log("OTT FULL RESPONSE:", JSON.stringify(ottResponse.data, null, 2));

//       const packages = ottResponse?.data?.data;

//       console.log("Extracted OTT packages:", packages);

//       if (!Array.isArray(packages)) {
//         return next(new AppError("Invalid OTT package list", 500));
//       }

//       const selectedOtt = packages.find(
//         p => String(p.packId) === String(ottPackageId)
//       );

//       console.log("Selected OTT Package:", selectedOtt);

//       if (!selectedOtt) {
//         return next(new AppError("Selected OTT package not found", 404));
//       }

//       ottPackageData = selectedOtt;
//       console.log("Final OTT Data:", ottPackageData);
//     } catch (error) {
//       console.error("🔥 OTT ERROR MESSAGE:", error.message);
//       console.error("🔥 OTT STATUS:", error?.response?.status);
//       console.error("🔥 OTT DATA:", error?.response?.data);
//       return next(new AppError("Could not fetch OTT packages", 500));
//     }
//   }

//   /* ================= SAVE PACKAGE ================= */
//   const packageData = {
//     name,
//     validity,
//     status,
//     typeOfPlan,
//     categoryOfPlan,
//     description,
//     basePrice,
//     offerPrice,
//     isIptv,
//     isOtt,
//     iptvPackageId: iptvPackageData,
//     ottPackageId: ottPackageData,
//   };

//   console.log("FINAL PACKAGE TO SAVE:", packageData);

//   const newPackage = await Package.create(packageData);

//   console.log("===== PACKAGE CREATED SUCCESSFULLY =====");

//   return successResponse(res, "Package created successfully", newPackage);
// });


const axios = require("axios");
const jwt = require("jsonwebtoken");
const Package = require("../../../models/package");
const Setting = require("../../../models/setting");
const catchAsync = require("../../../utils/catchAsync");
const AppError = require("../../../utils/AppError");
const { successResponse } = require("../../../utils/responseHandler");

// ================= PLAYBOX CONFIG =================
const PLAYBOX_API_KEY = "2ZsafDI6OV2IH5m18pqtS9k2C6Onnq5D82FcNsRh";
const PLAYBOX_PARTNER_KEY =
  "8588f445e9a912e828597d43702aa89a3a89ae2566024c49f8137652a49341e04d0946f2206d63856d3ec4d69f6dd409";

const PLAYBOX_ISS = "netwayinternetservices";
const PLAYBOX_AUD = "netway9net";

// ================= TOKEN UTILS =================
const isTokenExpired = (token) => {
  try {
    const decoded = jwt.decode(token);
    if (!decoded || !decoded.exp) return true;
    return decoded.exp * 1000 < Date.now();
  } catch {
    return true;
  }
};

const generatePlayboxToken = async () => {
  const response = await axios.post(
    "https://api.playboxtv.in/v5/token",
    { iss: PLAYBOX_ISS, aud: PLAYBOX_AUD },
    {
      headers: {
        "x-api-key": PLAYBOX_API_KEY,
        "Content-Type": "application/json",
      },
    }
  );

  const token = response?.data?.data;
  if (!token) throw new Error("PlayBox token missing");

  await Setting.findOneAndUpdate(
    {},
    { playBoxToken: token },
    { upsert: true, new: true }
  );

  return token;
};

// ================= CREATE PACKAGE =================
exports.createPackage = catchAsync(async (req, res, next) => {
  console.log("===== CREATE PACKAGE START =====");
  console.log("Request Body:", req.body);

  const {
    name,
    validity,
    status,
    typeOfPlan,
    categoryOfPlan,
    description,
    basePrice,
    offerPrice,

    isOtt = false,
    ottType,
    ottPackageId,

    isIptv = false,
    iptvType,
    iptvPackageId,
  } = req.body;

  /* ---------------- BASIC VALIDATION ---------------- */
  if (!name || !status || !validity?.number || !validity?.unit || !categoryOfPlan) {
    return next(new AppError("Missing required fields", 400));
  }

  const existing = await Package.findOne({ name, typeOfPlan });
  if (existing) {
    return next(new AppError("Package already exists", 409));
  }

  /* ================= IPTV LOGIC (UNCHANGED) ================= */
  let iptvPackageData = null;

  if (isIptv) {
    try {
      const iptvResponse = await axios.get(
        "http://159.89.146.245:5004/api/admin/package/iptv-packages/list",
        { timeout: 10000 }
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
    } catch {
      return next(new AppError("Could not fetch IPTV packages", 500));
    }
  }

  /* ================= OTT LOGIC (FINAL FIX) ================= */
let ottPackageData = null;

if (isOtt) {
  const ottListResponse = await axios.get(
    "http://159.89.146.245:5004/api/admin/package/ott-package/list",
    { timeout: 10000 }
  );

  const packages = ottListResponse?.data?.data || [];

  if (!Array.isArray(packages)) {
    return next(new AppError("Invalid OTT package list", 500));
  }

  const selectedOtt = packages.find(
    (p) => String(p.packId) === String(ottPackageId)
  );

  if (!selectedOtt) {
    return next(new AppError("Selected OTT package not found", 404));
  }

  // ✅ THIS OBJECT ALREADY MATCHES SCHEMA
  ottPackageData = selectedOtt;
}


  /* ================= SAVE PACKAGE ================= */
  const packageData = {
    name,
    validity,
    status,
    typeOfPlan,
    categoryOfPlan,
    description,
    basePrice,
    offerPrice,
    isIptv,
    isOtt,
    iptvPackageId: iptvPackageData,
    ottPackageId: ottPackageData,
  };

  const newPackage = await Package.create(packageData);

  return successResponse(res, "Package created successfully", newPackage);
});
