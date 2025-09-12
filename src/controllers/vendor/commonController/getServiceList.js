const Service = require("../../../models/service");
const catchAsync = require("../../../utils/catchAsync");
const {
  successResponse,
  errorResponse,
} = require("../../../utils/responseHandler");

exports.getServiceList = catchAsync(async (req, res) => {
  try {
    const serviceList = await Service.find({}).select("name");

    successResponse(res, "Service list fetched successfully", serviceList, 200);
  } catch (error) {
    console.error("Error in getList controller:", error);
    return errorResponse(res, "Internal server error", 500, error.message);
  }
});
