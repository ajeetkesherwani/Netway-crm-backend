// const axios = require("axios");
// const catchAsync = require("../../../utils/catchAsync");
// const AppError = require("../../../utils/AppError");
// const { successResponse } = require("../../../utils/responseHandler");
// const Setting = require("../../../models/setting");

// // ================= PLAYBOX CONFIG =================
// const PLAYBOX_API_KEY = "2ZsafDI6OV2IH5m18pqtS9k2C6Onnq5D82FcNsRh";
// const PLAYBOX_PARTNER_KEY =
//   "8588f445e9a912e828597d43702aa89a3a89ae2566024c49f8137652a49341e04d0946f2206d63856d3ec4d69f6dd409";

// const PLAYBOX_ISS = "netwayinternetservices";
// const PLAYBOX_AUD = "netway9net";

// // ================= TOKEN GENERATION =================
// const generatePlayboxToken = async () => {
//   console.log(" [TOKEN] Generating PlayBox token...");

//   let response;

//   try {
//     response = await axios.post(
//       "https://api.playboxtv.in/v5/token",
//       {
//         iss: PLAYBOX_ISS,
//         aud: PLAYBOX_AUD,
//       },
//       {
//         headers: {
//           "x-api-key": PLAYBOX_API_KEY,
//           "Content-Type": "application/json",
//         },
//         timeout: 10000,
//       }
//     );
//   } catch (err) {
//     console.error("[TOKEN] API FAILED");
//     console.error("Status:", err?.response?.status);
//     console.error("Response:", err?.response?.data);
//     console.error("Message:", err.message);
//     throw err;
//   }

//   console.log("[TOKEN] API RESPONSE:", response.data);

//   // ✅ FIXED LINE (MOST IMPORTANT)
//   const token = response?.data?.data;

//   if (!token) {
//     console.error("[TOKEN] Token missing in response");
//     throw new Error("PlayBox token generation failed");
//   }

//   console.log("[TOKEN] Token received:", token);

//   const setting = await Setting.findOneAndUpdate(
//     {},
//     { playBoxToken: token },
//     { upsert: true, new: true }
//   );

//   console.log("[TOKEN] Token saved in DB:", setting.playBoxToken);

//   return token;
// };

// // ================= OTT PACKAGE LIST =================
// exports.getOttPackageList = catchAsync(async (req, res, next) => {
//   console.log("[PACKS] Fetching OTT packages...");

//   let token;

//   try {
//     const setting = await Setting.findOne();
//     console.log("[PACKS] Setting from DB:", setting);

//     if (!setting || !setting.playBoxToken) {
//       console.log("[PACKS] No token in DB → generating new");
//       token = await generatePlayboxToken();
//     } else {
//       console.log("[PACKS] Using token from DB");
//       token = setting.playBoxToken;
//     }

//     console.log("[PACKS] Token used:", token);

//     const url = `https://api.playboxtv.in/v5/${PLAYBOX_PARTNER_KEY}/packs`;
//     console.log("[PACKS] URL:", url);

//     let response;

//     try {
//       response = await axios.get(url, {
//         headers: {
//           "x-api-key": PLAYBOX_API_KEY,
//           Authorization: `Bearer ${token}`,
//           "Content-Type": "application/json",
//         },
//         timeout: 10000,
//       });
//     } catch (err) {
//       console.error("[PACKS] API FAILED");
//       console.error("Status:", err?.response?.status);
//       console.error("Response:", err?.response?.data);

//       if (err?.response?.status === 401) {
//         console.log(" [PACKS] Token expired → regenerating");

//         token = await generatePlayboxToken();

//         response = await axios.get(url, {
//           headers: {
//             "x-api-key": PLAYBOX_API_KEY,
//             Authorization: `Bearer ${token}`,
//             "Content-Type": "application/json",
//           },
//           timeout: 10000,
//         });
//       } else {
//         throw err;
//       }
//     }

//     console.log("[PACKS] API RESPONSE:", response.data);

//     console.log("[PACKS] API RESPONSE:", response.data);

// const rawPackages = response?.data?.result || [];

// const cleanedPackages = rawPackages.map((pkg) => ({
//   packId: pkg.packs_id,
//   name: pkg.packs_name,
//   basePrice: pkg.amount,
//   marketPrice: pkg.marketPrice,
//   validity: {
//     number: Number(pkg.validity),
//     unit: "Day"
//   },
//   ottProviders: pkg.company_name.map((c) => ({
//     name: c.name.trim(),
//     validity: Number(c.validity)
//   }))
// }));

// return successResponse(
//   res,
//   "Packages found successfully",
//   cleanedPackages
// );


//     // return successResponse(res, "OTT packages fetched successfully", {
//     //   packages: response.data,
//     // });
//   } catch (error) {
//     console.error("[FINAL ERROR]");
//     console.error("Message:", error.message);
//     console.error("Status:", error?.response?.status);
//     console.error("Response:", error?.response?.data);

//     return next(
//       new AppError(
//         error?.response?.data?.message ||
//           error.message ||
//           "Failed to fetch OTT packages",
//         error?.response?.status || 500
//       )
//     );
//   }
// });


const axios = require("axios");
const jwt = require("jsonwebtoken");
const catchAsync = require("../../../utils/catchAsync");
const AppError = require("../../../utils/AppError");
const { successResponse } = require("../../../utils/responseHandler");
const Setting = require("../../../models/setting");

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

// ================= TOKEN GENERATION =================
const generatePlayboxToken = async () => {
  console.log("[TOKEN] Generating PlayBox token...");

  try {
    const response = await axios.post(
      "https://api.playboxtv.in/v5/token",
      {
        iss: PLAYBOX_ISS,
        aud: PLAYBOX_AUD,
      },
      {
        headers: {
          "x-api-key": PLAYBOX_API_KEY,
          "Content-Type": "application/json",
        },
        timeout: 10000,
      }
    );

    const token = response?.data?.data;

    if (!token) {
      throw new Error("PlayBox token missing in response");
    }

    await Setting.findOneAndUpdate(
      {},
      { playBoxToken: token },
      { upsert: true, new: true }
    );

    console.log("[TOKEN] Token generated & saved");
    return token;
  } catch (err) {
    console.error("[TOKEN] API FAILED");
    console.error("Status:", err?.response?.status);
    console.error("Response:", err?.response?.data);
    throw err;
  }
};

// ================= OTT PACKAGE LIST =================
exports.getOttPackageList = catchAsync(async (req, res, next) => {
  console.log("[PACKS] Fetching OTT packages...");

  let token;
  const setting = await Setting.findOne();

  if (!setting || !setting.playBoxToken || isTokenExpired(setting.playBoxToken)) {
    console.log("[PACKS] Token missing/expired → generating new");
    try {
      token = await generatePlayboxToken();
    } catch (error) {
      const statusCode = error?.response?.status || 502;
      const message =
        statusCode === 403
          ? "PlayBox denied token generation. Check the API credentials and partner access."
          : "Could not generate a PlayBox access token.";
      return next(new AppError(message, statusCode));
    }
  } else {
    console.log("[PACKS] Using token from DB");
    token = setting.playBoxToken;
  }

  const url = `https://api.playboxtv.in/v5/${PLAYBOX_PARTNER_KEY}/packs`;
  console.log("[PACKS] URL:", url);

  let response;

  try {
    response = await axios.get(url, {
      headers: {
        "x-api-key": PLAYBOX_API_KEY,
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      timeout: 10000,
    });
  } catch (err) {
    console.error("[PACKS] API FAILED");
    console.error("Status:", err?.response?.status);
    console.error("Response:", err?.response?.data);

    if ([400, 401, 403].includes(err?.response?.status)) {
      console.log("[PACKS] Token invalid → regenerating");

      try {
        token = await generatePlayboxToken();
      } catch (tokenError) {
        const statusCode = tokenError?.response?.status || 502;
        const message =
          statusCode === 403
            ? "PlayBox denied token generation. Check the API credentials and partner access."
            : "Could not generate a PlayBox access token.";
        return next(new AppError(message, statusCode));
      }

      try {
        response = await axios.get(url, {
          headers: {
            "x-api-key": PLAYBOX_API_KEY,
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          timeout: 10000,
        });
      } catch (retryError) {
        console.error("[PACKS] Request failed after token refresh");
        console.error("Status:", retryError?.response?.status);
        console.error("Response:", retryError?.response?.data);

        const statusCode = retryError?.response?.status || 502;
        const message =
          statusCode === 403
            ? "PlayBox still denies access after refreshing the token. Check API credentials, partner access, and package permissions."
            : "Could not fetch OTT packages from PlayBox after refreshing the token.";
        return next(new AppError(message, statusCode));
      }
    } else {
      throw err;
    }
  }

  const rawPackages = response?.data?.result || [];

  const cleanedPackages = rawPackages.map((pkg) => ({
    packId: pkg.packs_id,
    name: pkg.packs_name,
    basePrice: pkg.amount,
    marketPrice: pkg.marketPrice,
    validity: {
      number: Number(pkg.validity),
      unit: "Day",
    },
    ottProviders: pkg.company_name.map((c) => ({
      name: c.name.trim(),
      validity: Number(c.validity),
    })),
  }));

  return successResponse(
    res,
    "Packages found successfully",
    cleanedPackages
  );
});
