const RenewalHistory = require("../../../models/renewalHistory");
const Package = require("../../../models/package");
const catchAsync = require("../../../utils/catchAsync");
const AppError = require("../../../utils/AppError");
const { successResponse } = require("../../../utils/responseHandler");

exports.renewPurchasedPlan = catchAsync(async (req, res, next) => {
  const { userId } = req.params;

  if (!userId) { 
    return next(new AppError("userId is required", 400));
  }

  // Fetch renewal history
  const renewalList = await RenewalHistory
    .find({ userId })
    .lean()
    .sort({ renewedOn: -1 });

  if (renewalList.length === 0) {
    return successResponse(res, "No renewal history found", []);
  }

  //Get unique packageIds
  const packageIds = [
    ...new Set(renewalList.map(r => r.packageId.toString()))
  ];

  // Fetch package names
  const packages = await Package.find({ _id: { $in: packageIds } })
    .select("name")
    .lean();

  const packageMap = {};
  packages.forEach(pkg => {
    packageMap[pkg._id.toString()] = pkg.name;
  });

  //  Prepare response (ONLY required fields)
  const result = renewalList.map(renewal => {
    const packageName =
      packageMap[renewal.packageId.toString()] || "Unknown Package";

    const rechargeDate =
      renewal.renewedOn || renewal.newExpiryDate;

    return {
      packageName,
      rechargeDate: new Date(rechargeDate).toISOString(),
    };
  });

  return successResponse(
    res,
    "Renewal history fetched successfully",
    result
  );
});
