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
    customPrice,
    billType
  } = req.body;

  console.log("req.body", req.body);
  // Basic validation
  // if (!packageId || !packageName || !validity || !basePrice) {
  //   return next(new AppError("All fields are required", 400));
  // }

    // Check if the same package is already assigned and active
    const existingAssignment = await UserPackage.findOne({
        userId,
        packageId,
        status: "active"
    });

    if (existingAssignment) {
        return next(new AppError("This package is already assigned to the user.", 400));
    }


  // Save package entry
  const newAssignment = await UserPackage.create({
    userId,
    packageId,
    packageName,
    validity,
    basePrice,
    billType,
    customPrice,
    status: "active",
  });

  return successResponse(res, "Package assigned successfully", newAssignment);
});
