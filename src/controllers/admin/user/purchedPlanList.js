const purchasedPlan = require("../../../models/purchasedPlan");
const Package = require("../../../models/package");
const catchAsync = require("../../../utils/catchAsync");
const AppError = require("../../../utils/AppError");
const { successResponse } = require("../../../utils/responseHandler");

exports.getPurchasedPlanList = catchAsync(async (req, res, next) => {
  const { userId } = req.params;
  if (!userId) {
    return next(new AppError("userId is required", 400));
  }

  // Fetch all purchased plans for the user
  const plans = await purchasedPlan
    .find({ userId })
    .lean()
    .sort({ purchaseDate: -1 }); // Latest first

  if (plans.length === 0) {
    return successResponse(res, "No purchased plans found", []);
  }

  // Get unique package IDs
  const packageIds = [...new Set(plans.map((plan) => plan.packageId))];

  // Fetch package names in one query
  const packages = await Package.find({ _id: { $in: packageIds } })
    .select("name")
    .lean();

  const packageMap = {};
  packages.forEach((pkg) => {
    packageMap[pkg._id.toString()] = pkg.name;
  });

  // Process each plan to extract only required info
  const result = plans.map((plan) => {
    const packageName = packageMap[plan.packageId.toString()] || "Unknown Package";

    let rechargeDate;

    if (plan.isRenewed && plan.renewals && plan.renewals.length > 0) {
      // Get the LAST renewal date
      const lastRenewal = plan.renewals[plan.renewals.length - 1];
      rechargeDate = lastRenewal.renewedOn || lastRenewal.newExpiryDate;
    } else {
      // No renewal → use original purchase date
      rechargeDate = plan.purchaseDate;
    }

    return {
      packageName,
      rechargeDate: new Date(rechargeDate).toISOString(), 
    };
  });

  successResponse(res, "Purchased plan history fetched successfully", result);
});