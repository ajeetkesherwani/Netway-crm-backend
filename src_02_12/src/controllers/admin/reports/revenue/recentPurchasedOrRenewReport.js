const AppError = require("../../../../utils/AppError");
const catchAsync = require("../../../../utils/catchAsync");
const { successResponse } = require("../../../../utils/responseHandler");
const PurchasedPlan = require("../../../../models/purchasedPlan");

exports.recentPurchasedOrRenewReport = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 10 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  // 🔹 Today's date range
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  // 🔹 Fetch today's purchases or renewals
  const purchasedPlans = await PurchasedPlan.find({
    $or: [
      { createdAt: { $gte: startOfDay, $lte: endOfDay } },
      { "renewals.renewedOn": { $gte: startOfDay, $lte: endOfDay } }
    ]
  })
    .populate({
      path: "userId",
      select: "generalInformation.name generalInformation.username generalInformation.email generalInformation.phone generalInformation.address generalInformation.createdBy generalInformation.createdFor"
    })
    .populate("packageId", "name amount tax")
    .populate({
      path: "purchasedById",
      select: "generalInformation.name generalInformation.username",
      strictPopulate: false,
    })
    .skip(skip)
    .limit(parseInt(limit))
    .sort({ createdAt: -1 });

  const total = await PurchasedPlan.countDocuments({
    $or: [
      { createdAt: { $gte: startOfDay, $lte: endOfDay } },
      { "renewals.renewedOn": { $gte: startOfDay, $lte: endOfDay } }
    ]
  });

  // 🔹 Prepare formatted response
  const data = purchasedPlans.map(plan => {
    const user = plan.userId?.generalInformation || {};
    const purchasedBy = plan.purchasedById?.generalInformation || {};
    const latestRenewal =
      plan.renewals?.length > 0 ? plan.renewals[plan.renewals.length - 1] : null;

    const tax = plan.packageId?.tax || 0;
    const planAmount = plan.amountPaid || plan.packageId?.amount || 0;
    const totalAmount = planAmount + (tax / 100) * planAmount;

    return {
      username: user.username || "-",
      customerName: user.name || "-",
      status: plan.status,
      email: user.email || "-",
      phone: user.phone || "-",
      plan: plan.packageId?.name || "-",
      planAmount: planAmount.toFixed(2),
      tax: `${tax}%`,
      totalAmount: totalAmount.toFixed(2),
      reseller:
        plan.purchasedByRole === "Reseller"
          ? purchasedBy.name || "-"
          : "-",
      lco:
        plan.purchasedByRole === "Lco"
          ? purchasedBy.name || "-"
          : "-",
      registrationDate: plan.createdAt
        ? plan.createdAt.toISOString().split("T")[0]
        : "-",
      renewalDate: latestRenewal
        ? latestRenewal.renewedOn.toISOString().split("T")[0]
        : "-",
      address: user.address || "-",
    };
  });

  return successResponse(res, "Today's purchased or renewed plans fetched successfully", {
    total,
    page: parseInt(page),
    limit: parseInt(limit),
    data,
  });
});
