const PurchasedPlan = require("../../../../models/purchasedPlan");
const User = require("../../../../models/user");
const Package = require("../../../../models/package");
const catchAsync = require("../../../../utils/catchAsync");
const { successResponse } = require("../../../../utils/responseHandler");

exports.upcomingRenewalByMonth = catchAsync(async (req, res, next) => {
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

  const pipeline = [
    // Compute nextExpiry (either expiryDate or last renewal's newExpiryDate)
    {
      $addFields: {
        nextExpiry: {
          $cond: [
            { $eq: ["$isRenewed", true] },
            { $arrayElemAt: ["$renewals.newExpiryDate", -1] },
            "$expiryDate"
          ]
        }
      }
    },

    // Filter to only those expiring in this month
    {
      $match: {
        nextExpiry: {
          $gte: firstDayOfMonth,
          $lte: lastDayOfMonth
        }
      }
    },

    // Join with User
    {
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "user"
      }
    },
    { $unwind: "$user" },

    // Join with Package
    {
      $lookup: {
        from: "packages",
        localField: "packageId",
        foreignField: "_id",
        as: "packageInfo"
      }
    },
    { $unwind: "$packageInfo" },

    // Lookup creators: Admin, Reseller, Lco — using `user.generalInformation.createdFor.id` and type
    {
      $lookup: {
        from: "admins",
        localField: "user.generalInformation.createdFor.id",
        foreignField: "_id",
        as: "adminInfo"
      }
    },
    {
      $lookup: {
        from: "retailers",
        localField: "user.generalInformation.createdFor.id",
        foreignField: "_id",
        as: "resellerInfo"
      }
    },
    {
      $lookup: {
        from: "lcos",
        localField: "user.generalInformation.createdFor.id",
        foreignField: "_id",
        as: "lcoInfo"
      }
    },

    // Project the result with necessary fields
    {
      $project: {
        userId: "$user._id",
        Name: "$user.generalInformation.name",
        username: "$user.generalInformation.username",
        userPhone: "$user.generalInformation.phone",
        address: "$user.generalInformation.address",
        email: "$user.generalInformation.email",
        walletBalance: "$user.walletBalance",     // walletBalance is on user, not in generalInformation
        planName: "$packageInfo.name",
        planExpiry: "$nextExpiry",

        // choose fields from the lookups
        adminName: { $arrayElemAt: ["$adminInfo.name", 0] },
        resellerName: { $arrayElemAt: ["$resellerInfo.resellerName", 0] },
        lcoName: { $arrayElemAt: ["$lcoInfo.lcoName", 0] }
      }
    },

    // Sort by planExpiry ascending
    { $sort: { planExpiry: 1 } }
  ];

  const results = await PurchasedPlan.aggregate(pipeline);

  return successResponse(res, "Renewals for current month fetched", {
    month: now.toLocaleString("default", { month: "long" }),
    year: now.getFullYear(),
    total: results.length,
    data: results
  });
});
