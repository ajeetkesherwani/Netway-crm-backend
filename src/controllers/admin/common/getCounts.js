const Ticket = require("../../../models/ticket");
const User = require("../../../models/user");
const ActivityLog = require("../../../models/activityLog");
const PurchasedPlan = require("../../../models/purchasedPlan");
const {
  getDashboardDateRanges,
  getLatestPlanPerUserPipeline,
} = require("../../../utils/dashboardActivity");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");

exports.getCountSummary = catchAsync(async (req, res) => {
  const now = new Date();
  const periodRanges = getDashboardDateRanges(now);
  const createPeriodFacets = (dateField, prefix, extraMatch = {}) =>
    Object.entries(periodRanges).reduce((facets, [period, range]) => {
      const suffix = period[0].toUpperCase() + period.slice(1);
      facets[`${prefix}${suffix}`] = [
        {
          $match: {
            ...extraMatch,
            [dateField]: { $gte: range.start, $lt: range.end },
          },
        },
        { $count: "count" },
      ];
      return facets;
    }, {});
  const createExpiredPeriodFacets = () =>
    Object.entries(periodRanges).reduce((facets, [period, range]) => {
      const suffix = period[0].toUpperCase() + period.slice(1);
      const end = range.end < now ? range.end : now;
      facets[`expired${suffix}`] = [
        {
          $match: {
            status: { $in: ["active", "expired"] },
            expiryDate: { $gte: range.start, $lt: end },
          },
        },
        { $count: "count" },
      ];
      return facets;
    }, {});

  /* -------------------------------------------------
     1️⃣ TICKET COUNT BY STATUS
  ------------------------------------------------- */
  const ticketAggregation = await Ticket.aggregate([
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 }
      }
    }
  ]);

  const ticketCounts = {};
  let totalTickets = 0;

  ticketAggregation.forEach(t => {
    ticketCounts[t._id] = t.count;
    totalTickets += t.count;
  });

  ticketCounts.total = totalTickets;

  /* -------------------------------------------------
     2️⃣ CAF UPLOADED vs NOT UPLOADED USERS
     CAF Uploaded = Caf Form exists & has image
  ------------------------------------------------- */
  const cafAggregation = await User.aggregate([
    {
      $project: {
        cafUploaded: {
          $cond: [
            {
              $gt: [
                {
                  $size: {
                    $filter: {
                      input: { $ifNull: ["$document", []] },
                      as: "doc",
                      cond: {
                        $and: [
                          { $eq: ["$$doc.documentType", "Caf Form"] },
                          {
                            $gt: [
                              {
                                $size: {
                                  $ifNull: ["$$doc.documentImage", []]
                                }
                              },
                              0
                            ]
                          }
                        ]
                      }
                    }
                  }
                },
                0
              ]
            },
            "uploaded",        
            "notUploaded"
          ]
        }
      }
    },
    {
      $group: {
        _id: "$cafUploaded",
        count: { $sum: 1 }
      }
    }
  ]);

  let cafUploaded = 0;
  let cafNotUploaded = 0;

  cafAggregation.forEach(c => {
    if (c._id === "uploaded") cafUploaded = c.count;
    if (c._id === "notUploaded") cafNotUploaded = c.count;
  });

  /* -------------------------------------------------
     3️⃣ USER COUNT BY SERVICE OPTED
  ------------------------------------------------- */
  const serviceAggregation = await User.aggregate([
    {
      $group: {
        _id: "$generalInformation.serviceOpted",
        count: { $sum: 1 }
      }
    }
  ]);

  const serviceCounts = {
    intercom: 0,
    broadband: 0,
    corporate: 0
  };

  serviceAggregation.forEach(s => {
    const service = String(s._id || "").toLowerCase();
    const normalizedService = service === "coporate" ? "corporate" : service;
    if (Object.prototype.hasOwnProperty.call(serviceCounts, normalizedService)) {
      serviceCounts[normalizedService] += s.count;
    }
  });

  
  /* -------------------------------------------------
     4️⃣ USER COUNT BY eKYC STATUS
  ------------------------------------------------- */
  const ekycAggregation = await User.aggregate([
    {
      $project: {
        ekycStatus: {
          $cond: [
            { $eq: ["$additionalInformation.ekyc", "yes"] },
            "yes",
            "no"
          ]
        }
      }
    },
    {
      $group: {
        _id: "$ekycStatus",
        count: { $sum: 1 }
      }
    }
  ]);

  let ekycYes = 0;
  let ekycNo = 0;

  ekycAggregation.forEach(e => {
    if (e._id === "yes") ekycYes = e.count;
    if (e._id === "no") ekycNo = e.count;
  });

  const [
    userActivityAggregation,
    deletedActivityAggregation,
    expiredUserAggregation,
  ] = await Promise.all([
    User.aggregate([
      {
        $facet: {
          ...createPeriodFacets("createdAt", "registered"),
          ...createPeriodFacets("updatedAt", "inactive", { status: "Inactive" }),
          ...createPeriodFacets("updatedAt", "suspended", { status: "Suspend" }),
        },
      },
    ]),
    ActivityLog.aggregate([
      { $match: { type: "User Deleted" } },
      {
        $facet: {
          ...createPeriodFacets("createdAt", "deleted"),
        },
      },
    ]),
    PurchasedPlan.aggregate([
      ...getLatestPlanPerUserPipeline(),
      {
        $facet: {
          ...createExpiredPeriodFacets(),
        },
      },
    ]),
  ]);
  const userActivityCounts = userActivityAggregation[0] || {};
  const deletedActivityCounts = deletedActivityAggregation[0] || {};
  const expiredUserCounts = expiredUserAggregation[0] || {};
  const getCount = (source, facet) => source?.[facet]?.[0]?.count || 0;
  const userActivity = {};
  const categoryPrefixes = {
    registered: ["registered", userActivityCounts],
    inactive: ["inactive", userActivityCounts],
    suspended: ["suspended", userActivityCounts],
    expired: ["expired", expiredUserCounts],
    deleted: ["deleted", deletedActivityCounts],
  };

  Object.entries(categoryPrefixes).forEach(([category, [prefix, source]]) => {
    userActivity[category] = {};
    Object.keys(periodRanges).forEach((period) => {
      const suffix = period[0].toUpperCase() + period.slice(1);
      userActivity[category][period] = getCount(source, `${prefix}${suffix}`);
    });
  });

  /* -------------------------------------------------
     FINAL RESPONSE
  ------------------------------------------------- */
  return successResponse(res, "Dashboard summary fetched successfully", {
    tickets: ticketCounts,
    caf: {
      uploaded: cafUploaded,
      notUploaded: cafNotUploaded
    },
    serviceOpted: serviceCounts,
      ekyc: {
      yes: ekycYes,
      no: ekycNo
    },
    userActivity
  });
});
