// // const Package = require("../../../models/Package");
// const Package = require("../../../models/package");
// const UserPackage = require("../../../models/userPackage");
// const catchAsync = require("../../../utils/catchAsync");
// const { successResponse } = require("../../../utils/responseHandler");

// exports.getAvailablePackagesForUser = catchAsync(async (req, res, next) => {

//     const userId = req.params.userId;

//     // Fetch all packages assigned to the user and are active
//     const assignedPackages = await UserPackage.find({ userId, status: "active" }).select("packageId");
//     console.log("assignedPackages", assignedPackages);

//     const assignedPackageIds = assignedPackages.map(p => p.packageId.toString());

//     // Fetch all active packages excluding the ones already assigned
//     const availablePackages = await Package.find({
//         status: "active",
//         _id: { $nin: assignedPackageIds }
//     });

//     console.log("availablePackages", availablePackages.length);

//     return successResponse(res, "Available packages fetched successfully", availablePackages);
// });

// const Package = require("../../../models/Package");
const Package = require("../../../models/package");
const UserPackage = require("../../../models/userPackage");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");
const sanitizeSearchQuery = require("../../../utils/sanitizeSearchQuery");

exports.getAvailablePackagesForUser = catchAsync(async (req, res, next) => {
  const userId = req.params.userId;
  const { page = 1, limit = 10, search } = req.query;

  // Fetch all active packages assigned to the user
  const assignedPackages = await UserPackage.find({ userId }).select(
    "packageId"
  );

  // Only include valid packageIds (remove null/undefined)
  const assignedPackageIds = assignedPackages
    .map((p) => p.packageId)
    .filter((id) => id); // <--- important fix

  const safeSearch = sanitizeSearchQuery(search);
  const query = { status: "active", _id: { $nin: assignedPackageIds } };
  if (safeSearch) {
    query.name = { $regex: safeSearch, $options: "i" };
  }

  // Fetch all active packages excluding the already assigned ones
  const availablePackages = await Package.find(query)
    .skip((page - 1) * limit)
    .limit(Number(limit));

  return successResponse(
    res,
    "Available packages fetched successfully",
    availablePackages
  );
});
