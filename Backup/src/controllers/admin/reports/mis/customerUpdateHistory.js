const User = require("../../../../models/user");
const PurchasedPlan = require("../../../../models/purchasedPlan");
const catchAsync = require("../../../../utils/catchAsync");
const { successResponse } = require("../../../../utils/responseHandler");

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

exports.customerUpdateHistory = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 10 } = req.query;
  const parsedLimit = Math.min(parseInt(limit), 100);
  const skip = (parseInt(page) - 1) * parsedLimit;

  const total = await User.countDocuments();

  const users = await User.find()
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parsedLimit)
    .select("generalInformation.name generalInformation.username")
    .lean();

  const mappedUsers = await Promise.all(
    users.map(async (user) => {
      const plans = await PurchasedPlan.find({ userId: user._id })
        .populate("packageId")
        .sort({ createdAt: 1 }) // earliest to latest
        .lean();

      const oldPlan = plans[0];
      const newPlan = plans[plans.length - 1];

      const oldPlanName = oldPlan?.packageId?.name || "";
      const newPlanName = newPlan?.packageId?.name || "";
      const modifiedDate = newPlan?.updatedAt || "";

      return {
        ...user,
        oldPlanName,
        newPlanName,
        modifiedDate
      };
    })
  );

  return successResponse(res, "Customer update history fetched successfully", {
    total,
    page: parseInt(page),
    limit: parsedLimit,
    data: mappedUsers
  });
});
