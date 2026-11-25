const Logs = require("../models/activity");
const ActivityLog = require("../models/activityLog");
const { recordMonitoringLog } = require("../services/monitoringLogService");
const { getRequestContext } = require("../middleware/requestContext");

const createLog = async ({
  createdById,
  createdByRole,
  action,
  description = "",
  userId,
  type,
  details,
  ip,
  module = "business",
  targetId,
  targetName,
  targetType,
  addedBy,
}) => {
  const requestUser = getRequestContext()?.req?.user;
  const actorId = createdById || addedBy?.id;
  const actorRole = createdByRole || addedBy?.role;

  if (createdById && createdByRole && action) {
    try {
      await Logs.create({
        createdById,
        createdByRole,
        action,
        description
      });
    } catch (error) {
      console.error("Legacy log creation failed:", error.message);
    }
  }

  if (userId && type) {
    try {
      await ActivityLog.create({
        userId,
        type,
        description,
        details,
        ip,
        addedBy: {
          id: actorId,
          role: actorRole,
          name: requestUser?.name,
        },
      });
    } catch (error) {
      console.error("User activity log creation failed:", error.message);
    }
  }

  try {
    await recordMonitoringLog({
      type: "activity",
      isBusinessActivity: true,
      action: action || type,
      module,
      description,
      actorId,
      actorName: requestUser?.name,
      actorRole,
      status: "SUCCESS",
      ip,
      targetId: targetId || userId,
      targetName,
      targetType: targetType || (userId ? "user" : undefined),
      details,
    });
  } catch (error) {
    console.error("Monitoring activity log creation failed:", error.message);
  }
};

module.exports = createLog;
