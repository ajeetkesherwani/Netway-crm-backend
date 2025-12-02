const User = require("../../../../models/user");
const Admin = require("../../../../models/admin");
const PurchasedPlan = require("../../../../models/purchasedPlan");
const AppError = require("../../../../utils/AppError");
const catchAsync = require("../../../../utils/catchAsync");
const { successResponse } = require("../../../../utils/responseHandler");
const Reseller = require("../../../../models/retailer");
const Lco = require("../../../../models/lco");

const getActivePlanDetails = (plan) => {
  if (!plan) return { planName: "", planExpiry: "", lastPurchased: "", planActivation: "" };

  const planName = plan.packageId?.name || "";
  const planActivation = plan.packageId?.createdAt || "";

  let planExpiry = plan.expiryDate;
  let lastPurchased = plan.purchaseDate;

  if (plan.isRenewed && Array.isArray(plan.renewals) && plan.renewals.length > 0) {
    const lastRenewal = plan.renewals[plan.renewals.length - 1];
    planExpiry = lastRenewal?.newExpiryDate || plan.expiryDate;
    lastPurchased = lastRenewal?.renewedOn || lastPurchased;
  }

  return { planName, planExpiry, lastPurchased, planActivation };
};

const getCreatorDetails = (() => {
  const cache = new Map(); // Simple in-memory cache for creator details

  return async ({ id, type }) => {
    const key = `${type}_${id}`;
    if (cache.has(key)) return cache.get(key);

    let result = { adminName: "", resellerName: "", lcoName: "" };

    switch (type) {
      case "Admin":
        const admin = await Admin.findById(id).select("name").lean();
        result.adminName = admin?.name || "";
        break;

      case "Retailer":
        const reseller = await Reseller.findById(id).select("resellerName").lean();
        result.resellerName = reseller?.resellerName || "";
        break;

      case "Lco":
        const lco = await Lco.findById(id)
          .populate("retailerId", "resellerName")
          .select("lcoName retailerId")
          .lean();
        result.lcoName = lco?.lcoName || "";
        result.resellerName = lco?.retailerId?.resellerName || "";
        break;
    }

    cache.set(key, result); // Memoize
    return result;
  };
})();


exports.customerBalanceReport = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 10 } = req.query;
  const parsedLimit = Math.min(parseInt(limit), 100);
  const skip = (parseInt(page) - 1) * parsedLimit;

  const total = await User.countDocuments();

  const users = await User.find()
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parsedLimit)
    .select(
      "generalInformation.createdFor generalInformation.name generalInformation.email generalInformation.username generalInformation.phone generalInformation.state generalInformation.address generalInformation.city walletBalance"
    )
    .lean();

  const mappedUsers = await Promise.all(
    users.map(async (user) => {
      const creator = user.generalInformation?.createdFor
        ? await getCreatorDetails(user.generalInformation.createdFor)
        : { adminName: "", resellerName: "", lcoName: "" };

      const activePlan = await PurchasedPlan.findOne({
        userId: user._id,
        status: "active"
      })
        .populate("packageId")
        .sort({ createdAt: -1 }) // In case of multiple active, get the latest
        .lean();

      const planDetails = getActivePlanDetails(activePlan);

      return {
        ...user,
        ...creator,
        ...planDetails
      };
    })
  );

  return successResponse(res, "Transactions fetched successfully", {
    total,
    page: parseInt(page),
    limit: parsedLimit,
    data: mappedUsers
  });
});




