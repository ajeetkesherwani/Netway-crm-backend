const Logs = require("../models/activity");

const accountRoles = {
  admin: "Admin",
  staff: "Staff",
  reseller: "Reseller",
  lco: "Lco",
};

const createLoginAuditLog = async ({ req, user, userType, employee }) => {
  const createdByRole = accountRoles[String(userType).toLowerCase()];
  if (!createdByRole) {
    throw new Error(`Unsupported login account type: ${userType}`);
  }

  const actorName =
    employee?.employeeName ||
    employee?.staffName ||
    employee?.name ||
    user.adminName ||
    user.resellerName ||
    user.lcoName ||
    user.staffName ||
    user.name ||
    "Unknown";
  const actorId = employee?._id || user._id;
  const actorRole =
    employee?.role?.roleName ||
    (createdByRole === "Staff" ? user.role?.roleName : employee?.type) ||
    user.role?.roleName ||
    createdByRole;
  const ip = req.ip || req.socket?.remoteAddress || "";

  await Logs.create({
    createdById: user._id,
    createdByRole,
    actorId: String(actorId),
    actorName,
    actorRole,
    action: "LOGIN",
    description: `${actorName} logged in successfully.`,
    ip,
    requestId: req.requestId,
    userAgent: req.get?.("user-agent") || req.headers?.["user-agent"] || "",
    status: "SUCCESS",
  });
};

module.exports = createLoginAuditLog;
