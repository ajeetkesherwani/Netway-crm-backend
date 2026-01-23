const axios = require("axios");
const catchAsync = require("../../../utils/catchAsync");
const AppError = require("../../../utils/AppError");
const { successResponse } = require("../../../utils/responseHandler");

// curl -v \
//   -X GET "https://api.playboxtv.in/v5/8588f445e9a912e828597d43702aa89a3a89ae2566024c49f8137652a49341e04d0946f2206d63856d3ec4d69f6dd409/packs" \
//   -H "x-api-key: 2ZsafDI6OV2IH5m18pqtS9k2C6Onnq5D82FcNsRh" \
//   -H "Content-Type: application/json"


const PLAYBOX_API_KEY = "2ZsafDI6OV2IH5m18pqtS9k2C6Onnq5D82FcNsRh";
const PLAYBOX_PARTNER_KEY = "8588f445e9a912e828597d43702aa89a3a89ae2566024c49f8137652a49341e04d0946f2206d63856d3ec4d69f6dd409";

exports.getOttPackageList = catchAsync(async (req, res, next) => {
  try {
    const url = `https://api.playboxtv.in/v5/${PLAYBOX_PARTNER_KEY}/packs`;

    const response = await axios.get(url, {
      headers: {
        "x-api-key": PLAYBOX_API_KEY,
        "Content-Type": "application/json",
      },
      timeout: 10000,
    });

    if (!response?.data) {
      return next(new AppError("No OTT packages found", 404));
    }

    console.log("OTT packages:", response.data);

    return successResponse(
      res,
      "OTT packages fetched successfully",
      { packages: response.data }
    );

  } catch (error) {
    // ✅ THIS IS THE FIX
    console.log(error.response.data,"error");
    console.log(error.response, "error cehck");
    if (error.response) {
      return next(
        new AppError(
          error.response.data?.message || "Playbox API error",
          error.response.status
        )
      );
    }

    return next(new AppError("Failed to fetch OTT packages", 500));
  }
});
