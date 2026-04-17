const packageService = require("../../../services/packageServices");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");

exports.getSoapPackages = catchAsync(async (req, res, next) => {

  const packages = await packageService.getAllPackages();

    // console.log("🔥 Packages:", packages);

  if (!packages || packages.length === 0) {
    return next(new AppError("No packages found", 404));
  }

  successResponse(res, "Packages fetched successfully", packages);

});