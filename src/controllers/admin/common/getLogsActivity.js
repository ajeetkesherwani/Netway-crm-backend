const Logs = require("../../../models/activity");
const MonitoringLog = require("../../../models/monitoringLog");
const catchAsync = require("../../../utils/catchAsync");
const AppError = require("../../../utils/AppError");
const { successResponse } = require("../../../utils/responseHandler");

exports.getLogsByRoleAndId = catchAsync(async (req, res, next) => {
  const { role, id } = req.params;

  if (!role || !id) {
    return next(new AppError("Role and ID are required", 400));
  }

  const formattedRole = role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();

  const validRoles = ["Admin", "Staff", "Reseller", "Lco", "User"];
  if (!validRoles.includes(formattedRole)) {
    return next(new AppError("Invalid role provided", 400));
  }

  const filter = String(req.query.filter || "").toLowerCase();
  if (filter && !["audit", "activity"].includes(filter)) {
    return next(new AppError("filter must be audit or activity", 400));
  }

  if (filter === "audit") {
    const auditQuery = {
      createdByRole: formattedRole,
      createdById: id,
      action: "LOGIN",
    };
    const auditLogs = await Logs.find(auditQuery)
      .sort({ createdAt: -1 })
      .populate({
        path: "createdById",
        select: "staffName resellerName lcoName adminName generalInformation.name generalInformation.username",
      })
      .lean();

    return successResponse(res, "Audit logs fetched successfully", {
      total: auditLogs.length,
      data: auditLogs,
    });
  }

  if (filter === "activity") {
    const activityQuery = {
      type: "activity",
      actorId: String(id),
      path: { $not: /\/api\/admin\/auth\/(?:login|verify-otp)(?:\/|$)/i },
    };
    const activityLogs = await MonitoringLog.find(activityQuery)
      .sort({ createdAt: -1 })
      .lean();

    return successResponse(res, "Activity logs fetched successfully", {
      total: activityLogs.length,
      data: activityLogs,
    });
  }

  // Fetch logs and populate the correct fields dynamically
  const logs = await Logs.find({
    createdByRole: formattedRole,
    createdById: id
  })
    .sort({ createdAt: -1 })
    .populate({
      path: "createdById",
      select: "staffName resellerName lcoName adminName generalInformation.name generalInformation.username"
    })
    .lean(); // faster for read-only operations

  successResponse(res, "Logs fetched successfully", {
    total: logs.length,
    data: logs
  });
});
