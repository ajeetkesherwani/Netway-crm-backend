const mongoose = require("mongoose");
const PurchasedPlan = require("../../../../models/purchasedPlan");
const User = require("../../../../models/user");
const catchAsync = require("../../../../utils/catchAsync");
const { successResponse } = require("../../../../utils/responseHandler");
const Admin = require("../../../../models/admin");
const Reseller = require("../../../../models/retailer");
const Lco = require("../../../../models/lco");

exports.upcomingRenewalByDays = catchAsync(async (req, res, next) => {
  const { daysAhead = 2, page = 1, limit = 50 } = req.query;
  const parsedLimit = Math.min(parseInt(limit), 100);
  const skip = (parseInt(page) - 1) * parsedLimit;

  // Today’s date at midnight
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  // endDate = now + daysAhead days
  const endDate = new Date(now);
  endDate.setDate(endDate.getDate() + parseInt(daysAhead));

  // Aggregation pipeline
  const pipeline = [
    // Add a field `nextExpiry`:
    //   if isRenewed: get last renewal's newExpiryDate
    //   else: use expiryDate
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

    // Filter to those whose nextExpiry is between today and endDate (inclusive)
    {
      $match: {
        nextExpiry: { $gte: now, $lte: endDate }
      }
    },

    // Compute daysRemaining = difference in days between nextExpiry and today
    {
      $addFields: {
        daysRemaining: {
          $trunc: {
            $divide: [
              { $subtract: ["$nextExpiry", now] },
              1000 * 60 * 60 * 24
            ]
          }
        }
      }
    },

    // Join / lookup to User
    {
      $lookup: {
        from: "users",       // Mongo collection name (usually lowercase plural)
        localField: "userId",
        foreignField: "_id",
        as: "user"
      }
    },
    { $unwind: "$user" },

    // Join / lookup to package to get name
    {
      $lookup: {
        from: "packages",
        localField: "packageId",
        foreignField: "_id",
        as: "packageInfo"
      }
    },
    { $unwind: "$packageInfo" },

    // Optionally, you can do lookups for creator (Admin / Reseller / Lco) if stored on the user doc
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

    // Project fields you need
    {
      $project: {
        _id: 1,
        nextExpiry: 1,
        daysRemaining: 1,
        "user._id": 1,
        "user.generalInformation.name": 1,
        "user.generalInformation.address": 1,
        "user.generalInformation.phone": 1,
        "user.generalInformation.email": 1,
        "user.generalInformation.username": 1,
        "user.walletBalance": 1,
        packageName: "$packageInfo.name",
        adminName: { $arrayElemAt: ["$adminInfo.name", 0] },
        resellerName: { $arrayElemAt: ["$resellerInfo.resellerName", 0] },
        lcoName: { $arrayElemAt: ["$lcoInfo.lcoName", 0] },
      }
    },

    // Sort by daysRemaining ascending
    { $sort: { daysRemaining: 1 } },

    // Pagination
    { $skip: skip },
    { $limit: parsedLimit }
  ];

  const results = await PurchasedPlan.aggregate(pipeline);

  // Also you may want count for total
  const countPipeline = pipeline.slice(0, pipeline.length - 3); // up to before skip/limit
  countPipeline.push({ $count: "total" });
  const countResult = await PurchasedPlan.aggregate(countPipeline);
  const total = (countResult[0] && countResult[0].total) || 0;

  return successResponse(res, "Upcoming renewals fetched", {
    total,
    page: parseInt(page),
    limit: parsedLimit,
    data: results
  });
});

