const User = require("../../../models/user");
const PurchasedPlan = require("../../../models/purchasedPlan");
const catchAsync = require("../../../utils/catchAsync");
const AppError = require("../../../utils/AppError");
const { successResponse } = require("../../../utils/responseHandler");

const startOfDay = (date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

const addDays = (date, days) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);

const formatDateKey = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const parseDateKey = (value) => {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return null;
  }
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
    ? date
    : null;
};

const getEffectiveExpiry = (plan) => {
  const renewalDates = (plan.renewals || [])
    .map((renewal) => new Date(renewal.newExpiryDate))
    .filter((date) => !Number.isNaN(date.getTime()));

  if (plan.isRenewed && renewalDates.length) {
    return new Date(Math.max(...renewalDates.map((date) => date.getTime())));
  }

  const expiryDate = new Date(plan.expiryDate);
  return Number.isNaN(expiryDate.getTime()) ? null : expiryDate;
};

const getRoleUserQuery = (user) => {
  if (user.role === "Reseller") {
    return {
      "generalInformation.createdFor.type": "Retailer",
      "generalInformation.createdFor.id": user._id,
    };
  }
  if (user.role === "Lco") {
    return {
      "generalInformation.createdFor.type": "Lco",
      "generalInformation.createdFor.id": user._id,
    };
  }
  return {};
};

const getLatestPlansByUser = (plans) => {
  const latestPlans = new Map();

  for (const plan of plans) {
    const expiryDate = getEffectiveExpiry(plan);
    if (!expiryDate) continue;

    const userId = String(plan.userId);
    const current = latestPlans.get(userId);
    const purchaseTime = new Date(plan.purchaseDate || 0).getTime();
    const currentPurchaseTime = current
      ? new Date(current.plan.purchaseDate || 0).getTime()
      : 0;

    if (
      !current ||
      expiryDate > current.expiryDate ||
      (expiryDate.getTime() === current.expiryDate.getTime() &&
        purchaseTime > currentPurchaseTime)
    ) {
      latestPlans.set(userId, { plan, expiryDate });
    }
  }

  return latestPlans;
};

const getCalendarData = async (req) => {
  const users = await User.find(getRoleUserQuery(req.user))
    .select(
      "_id status generalInformation.name generalInformation.email generalInformation.phone addressDetails.permanentAddress.addressine1"
    )
    .lean();

  const plans = users.length
    ? await PurchasedPlan.find({
        userId: { $in: users.map((user) => user._id) },
      })
        .select("userId packageId status expiryDate isRenewed renewals purchaseDate")
        .populate("packageId", "name")
        .lean()
    : [];

  const usersById = new Map(users.map((user) => [String(user._id), user]));
  const latestPlans = getLatestPlansByUser(plans);
  const today = startOfDay(new Date());
  const upcomingDates = Array.from({ length: 11 }, (_, index) =>
    addDays(today, index)
  );
  const expiredDates = Array.from({ length: 10 }, (_, index) =>
    addDays(today, -(index + 1))
  );
  const upcomingByDate = new Map();
  const expiredByDate = new Map();

  for (const [userId, { plan, expiryDate }] of latestPlans) {
    const user = usersById.get(userId);
    if (!user) continue;

    const expiryDay = startOfDay(expiryDate);
    const dateKey = formatDateKey(expiryDay);
    const userWithPlan = {
      ...user,
      renewalPlan: {
        planId: plan._id,
        planName: plan.packageId?.name || "N/A",
        expiryDate,
        status: plan.status,
      },
    };

    if (
      plan.status === "active" &&
      expiryDay >= today &&
      expiryDay <= addDays(today, 10)
    ) {
      const usersForDate = upcomingByDate.get(dateKey) || [];
      usersForDate.push(userWithPlan);
      upcomingByDate.set(dateKey, usersForDate);
    } else if (
      ["expired", "active"].includes(plan.status) &&
      expiryDay >= addDays(today, -10) &&
      expiryDay < today
    ) {
      const usersForDate = expiredByDate.get(dateKey) || [];
      usersForDate.push(userWithPlan);
      expiredByDate.set(dateKey, usersForDate);
    }
  }

  return {
    upcoming: upcomingDates.map((date) => {
      const key = formatDateKey(date);
      return { date: key, count: upcomingByDate.get(key)?.length || 0 };
    }),
    expired: expiredDates.map((date) => {
      const key = formatDateKey(date);
      return { date: key, count: expiredByDate.get(key)?.length || 0 };
    }),
    upcomingByDate,
    expiredByDate,
    today,
  };
};

exports.getRenewalCalendar = catchAsync(async (req, res) => {
  const { upcoming, expired } = await getCalendarData(req);

  return successResponse(res, "Renewal calendar fetched successfully", {
    upcoming,
    expired,
  });
});

exports.getRenewalCalendarUsers = catchAsync(async (req, res, next) => {
  const { date, type } = req.query;
  if (!["upcoming", "expired"].includes(type)) {
    return next(new AppError("type must be upcoming or expired", 400));
  }

  const selectedDate = parseDateKey(date);
  if (!selectedDate) {
    return next(new AppError("date must be a valid YYYY-MM-DD date", 400));
  }

  const today = startOfDay(new Date());
  const isInRange =
    type === "upcoming"
      ? selectedDate >= today && selectedDate <= addDays(today, 10)
      : selectedDate >= addDays(today, -10) && selectedDate < today;

  if (!isInRange) {
    return next(new AppError("date is outside the renewal calendar range", 400));
  }

  const { upcomingByDate, expiredByDate } = await getCalendarData(req);
  const usersByDate = type === "upcoming" ? upcomingByDate : expiredByDate;

  return successResponse(
    res,
    "Renewal calendar users fetched successfully",
    usersByDate.get(formatDateKey(selectedDate)) || []
  );
});
