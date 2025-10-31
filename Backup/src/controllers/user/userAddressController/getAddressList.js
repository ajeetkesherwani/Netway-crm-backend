const userAddress = require("../../../models/userAddresses");
const catchAsync = require("../../../utils/catchAsync");
const {
  successResponse,
  errorResponse,
} = require("../../../utils/responseHandler");

exports.getAddressList = catchAsync(async (req, res, next) => {
  try {
    const userId = req.user.id;
    console.log("userId", userId);
    const userAllAdd = await userAddress.find({ userId: userId });
    console.log("userAllAdd", userAllAdd);
    if (!userAllAdd || userAllAdd.length === 0) {
      successResponse(res, "No userAddress found", [], 200);
    }

    successResponse(res, "UserAddress retrieved successfully", userAllAdd, 200);
  } catch (error) {
    console.error("Error in get services controller:", error);
    errorResponse(res, "Internal server error", 500, error);
  }
});
