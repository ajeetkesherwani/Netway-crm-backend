const getDashboardDateRanges = (date = new Date()) => {
  const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const startOfTomorrow = new Date(startOfDay);
  startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);
  const startOfYesterday = new Date(startOfDay);
  startOfYesterday.setDate(startOfYesterday.getDate() - 1);
  const startOfWeek = new Date(startOfDay);
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
  const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);

  return {
    yesterday: { start: startOfYesterday, end: startOfDay },
    today: { start: startOfDay, end: startOfTomorrow },
    week: { start: startOfWeek, end: startOfTomorrow },
    month: { start: startOfMonth, end: startOfTomorrow },
    previousMonth: {
      start: new Date(date.getFullYear(), date.getMonth() - 1, 1),
      end: startOfMonth,
    },
    year: {
      start: new Date(date.getFullYear(), 0, 1),
      end: startOfTomorrow,
    },
  };
};

const getLatestPlanPerUserPipeline = () => [
  {
    $addFields: {
      effectiveExpiryDate: {
        $let: {
          vars: {
            latestRenewalExpiry: { $max: "$renewals.newExpiryDate" },
          },
          in: {
            $cond: [
              {
                $and: [
                  { $eq: ["$isRenewed", true] },
                  { $ne: ["$$latestRenewalExpiry", null] },
                ],
              },
              "$$latestRenewalExpiry",
              "$expiryDate",
            ],
          },
        },
      },
    },
  },
  { $match: { effectiveExpiryDate: { $type: "date" } } },
  {
    $sort: {
      userId: 1,
      effectiveExpiryDate: -1,
      purchaseDate: -1,
    },
  },
  {
    $group: {
      _id: "$userId",
      expiryDate: { $first: "$effectiveExpiryDate" },
      status: { $first: "$status" },
    },
  },
  {
    $lookup: {
      from: "users",
      localField: "_id",
      foreignField: "_id",
      as: "user",
    },
  },
  { $match: { "user.0": { $exists: true } } },
];

module.exports = {
  getDashboardDateRanges,
  getLatestPlanPerUserPipeline,
};
