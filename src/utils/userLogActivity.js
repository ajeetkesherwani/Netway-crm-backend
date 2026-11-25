const ActivityLog = require("../models/activityLog");
const { recordMonitoringLog } = require("../services/monitoringLogService");
const { getRequestContext } = require("../middleware/requestContext");

exports.createLog = async ({
  userId,
  type,
  description,
  details,
  addedBy,
  ip,
  module = "business",
  targetType = "user",
  targetId = userId,
  targetName,
}) => {
  try {
    const request = getRequestContext()?.req;
    const requestUser = request?.user;
    const logIp = ip || request?.ip || request?.headers?.["x-forwarded-for"];
    const actor = addedBy
      ? { ...addedBy, name: addedBy.name || requestUser?.name }
      : undefined;

    await ActivityLog.create({
      userId,
      type,
      description,
      details,
      ip: logIp,
      addedBy: actor
    });
    await recordMonitoringLog({
      type: "activity",
      isBusinessActivity: true,
      action: type,
      module,
      description,
      actor: actor
        ? {
            id: actor.id,
            name: actor.name,
            role: actor.role,
          }
        : undefined,
      targetId,
      targetName,
      targetType,
      ip: logIp,
      status: "SUCCESS",
      details,
    });
  } catch (err) {
    console.log("Activity Log Error:", err.message);
  }
};
