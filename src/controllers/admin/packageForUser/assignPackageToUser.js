const UserPackage = require("../../../models/userPackage");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");
const { createLog } = require("../../../utils/userLogActivity");

exports.assignPackageToUser = catchAsync(async (req, res, next) => {
  const userId = req.params.userId;
  const {
    packageId,
    packageName,
    validity,
    basePrice,
    customPrice,
    billType,
    startDate,
    endDate,
    hasOtt,
    hasIptv,
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
    status: "active",
  });

  if (existingAssignment) {
    return next(
      new AppError("This package is already assigned to the user.", 400)
    );
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
    startDate,
    endDate,
    hasOtt,
    hasIptv,
  });

  await createLog({
    userId,
    type: "Package Assigned To User",
    description: `Package ${packageName} assigned to customer ${userId}`,
    details: {
      assignmentId: newAssignment._id,
      customerId: userId,
      packageId,
      packageName,
      validity,
      basePrice,
      customPrice,
      billType,
      startDate,
      endDate,
      hasOtt,
      hasIptv,
      status: newAssignment.status,
      assignedById: req.user._id,
      assignedByRole: req.user.role,
    },
    addedBy: { id: req.user._id, role: req.user.role || "Admin" },
    ip: req.ip || req.headers["x-forwarded-for"],
    module: "package-assignment",
    targetType: "userPackage",
    targetId: newAssignment._id,
    targetName: packageName,
  });

  return successResponse(res, "Package assigned successfully", newAssignment);
});
