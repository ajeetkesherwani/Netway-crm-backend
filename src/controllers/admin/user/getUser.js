const { default: mongoose } = require("mongoose");
const User = require("../../../models/user");
const ActivityLog = require("../../../models/activityLog");
const PurchasedPlan = require("../../../models/purchasedPlan");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");
const {
  getDashboardDateRanges,
  getLatestPlanPerUserPipeline,
} = require("../../../utils/dashboardActivity");
// const sendEmail = require("../../../utils/sendEmail");

exports.getUserList = catchAsync(async (req, res, next) => {
  const {
    searchQuery,
    status,
    area,
    subZone,
    ekyc,
    startDate,
    endDate,
    serviceOpted,
    reseller,
    lco,
    cafUploaded,
    connectionType,
    installationBy,
    serverType,
    dashboardActivity,
    dashboardPeriod,
  } = req.query;

  const query = {};
  if (dashboardActivity || dashboardPeriod) {
    const activityTypes = ["registered", "inactive", "suspended", "expired", "deleted"];
    const periodRange = getDashboardDateRanges()[dashboardPeriod];
    if (!activityTypes.includes(dashboardActivity) || !periodRange) {
      return next(new AppError("Invalid dashboard activity filter", 400));
    }

    const end =
      dashboardActivity === "expired"
        ? new Date(Math.min(periodRange.end.getTime(), Date.now()))
        : periodRange.end;
    const dateRange = { $gte: periodRange.start, $lt: end };

    if (dashboardActivity === "deleted") {
      const logQuery = {
        type: "User Deleted",
        createdAt: dateRange,
      };
      if (searchQuery && searchQuery.trim()) {
        const safeSearch = searchQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        logQuery.$or = [
          { "details.customerName": { $regex: safeSearch, $options: "i" } },
          { "details.username": { $regex: safeSearch, $options: "i" } },
          { "details.userId": { $regex: safeSearch, $options: "i" } },
        ];
      }

      const deletedLogs = await ActivityLog.find(logQuery)
        .sort({ createdAt: -1 })
        .lean();
      const deletedUsers = deletedLogs.map((log) => ({
        _id: log._id,
        generalInformation: {
          name:
            log.details?.customerName ||
            log.details?.username ||
            "Deleted user",
          username: log.details?.username || "",
          UserId: log.details?.userId || "",
        },
        status: "Deleted",
        createdAt: log.createdAt,
      }));
      return successResponse(res, "Deleted users fetched successfully", deletedUsers);
    }

    if (dashboardActivity === "registered") {
      query.createdAt = dateRange;
    } else if (dashboardActivity === "inactive") {
      query.status = "Inactive";
      query.updatedAt = dateRange;
    } else if (dashboardActivity === "suspended") {
      query.status = "Suspend";
      query.updatedAt = dateRange;
    } else if (dashboardActivity === "expired") {
      const latestExpiredPlans = await PurchasedPlan.aggregate([
        ...getLatestPlanPerUserPipeline(),
        {
          $match: {
            status: { $in: ["active", "expired"] },
            expiryDate: dateRange,
          },
        },
        { $project: { _id: 0, userId: "$_id" } },
      ]);
      query._id = { $in: latestExpiredPlans.map((plan) => plan.userId) };
    }
  }

  if (searchQuery && searchQuery.trim()) {
    const safeSearch = searchQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    query.$or = [
      { "generalInformation.name": { $regex: safeSearch, $options: "i" } },
      { "generalInformation.username": { $regex: safeSearch, $options: "i" } },
      { "generalInformation.UserId": { $regex: safeSearch, $options: "i" } },
      { "generalInformation.email": { $regex: safeSearch, $options: "i" } },
      { "generalInformation.phone": { $regex: safeSearch, $options: "i" } },
    ];
  }
  if (area) {
    query["addressDetails.area"] = new mongoose.Types.ObjectId(area);
  }

  if (subZone) {
    query["addressDetails.subZone"] = new mongoose.Types.ObjectId(subZone);
  }

  if (status) {
    query.status = status;
  }

  if (ekyc) {
    query["additionalInformation.ekyc"] =
      ekyc === "no" ? { $ne: "yes" } : ekyc;
  }

  if (serviceOpted) {
    query["generalInformation.serviceOpted"] =
      serviceOpted === "corporate"
        ? { $in: ["corporate", "coporate"] }
        : serviceOpted;
  }

  if (connectionType) {
    query["generalInformation.connectionType"] = connectionType.toLowerCase();
  }

  if (serverType && serverType.trim()) {
    query["generalInformation.serverType"] = { $regex: serverType.trim(), $options: "i" };
  }

  if (installationBy) {
    const installCondition = [];
    if (mongoose.Types.ObjectId.isValid(installationBy)) {
      installCondition.push({ "generalInformation.installationBy": new mongoose.Types.ObjectId(installationBy) });
    }
    installCondition.push({ "generalInformation.installationByName": { $regex: installationBy, $options: "i" } });

    if (!query.$and) {
      query.$and = [];
    }
    query.$and.push({ $or: installCondition });
  }

  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      query.createdAt.$lte = end;
    }
  }
  if (reseller) {
    query["generalInformation.createdFor.type"] = "Retailer";
    query["generalInformation.createdFor.id"] = new mongoose.Types.ObjectId(
      reseller
    );
  } else if (lco) {
    query["generalInformation.createdFor.type"] = "Lco";
    query["generalInformation.createdFor.id"] = new mongoose.Types.ObjectId(
      lco
    );
  }


  /* ---------------- CAF FORM FILTER ---------------- */
  if (cafUploaded === "yes") {
    query.document = {
      $elemMatch: {
        documentType: "Caf Form",
        documentImage: { $type: "array", $ne: [] },
      },
    };
  }

  if (cafUploaded === "no") {
    query.$nor = [
      {
        document: {
          $elemMatch: {
            documentType: "Caf Form",
            documentImage: { $type: "array", $ne: [] },
          },
        },
      },
    ];
  }

  const users = await User.find(query).sort({ createdAt: -1 }).lean();
  if (!users) return next(new AppError("User not found", 404));

  // Explicitly add IPACCT IDs and serverType to the root level for easy access in frontend
  const mappedUsers = users.map(user => {
    user.ipactId = user.generalInformation?.ipactId || "";
    user.ipacctCustomerId = user.generalInformation?.ipacctCustomerId || "";
    user.serverType = user.generalInformation?.serverType || null;
    return user;
  });

  successResponse(res, "User found successfully", mappedUsers);
});
