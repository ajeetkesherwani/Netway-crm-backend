const packageService = require("../../../services/packageServices");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");

exports.getSoapPackages = catchAsync(async (req, res, next) => {

  const packages = await packageService.syncAndUpdatePackages();

  successResponse(res, "Packages fetched successfully", packages);

});