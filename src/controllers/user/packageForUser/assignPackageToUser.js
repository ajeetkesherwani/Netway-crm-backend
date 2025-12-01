const UserPackage = require("../../../models/userPackage")
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");

exports.assignPackageToUser = catchAsync(async (req, res, next) => {
    const userId = req.params.userId; 
  const {
    packageId,
    packageName,
    validity,
    basePrice,
    cutomePrice,
    billType
  } = req.body;

  // Basic validation
  if (!userId || !packageId || !packageName || !validity || !basePrice) {
    return next(new AppError("All fields are required", 400));
  }

  // Save package entry
  const newAssignment = await UserPackage.create({
    userId,
    packageId,
    packageName,
    validity,
    basePrice,
    billType,
    startDate,
    cutomePrice,
    endDate,
    status: "active",
  });

  return successResponse(res, "Package assigned successfully", newAssignment);
});
