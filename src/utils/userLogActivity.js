const ActivityLog = require("../models/activityLog");
const { recordMonitoringLog } = require("../services/monitoringLogService");

exports.createLog = async ({ userId, type, description, details, addedBy, ip }) => {
  try {
    await ActivityLog.create({
      userId,
      type,
      description,
      details,
      ip,
      addedBy
    });
    await recordMonitoringLog({
      type: "activity",
      action: type,
      module: "business",
      description,
      actor: addedBy
        ? {
            id: addedBy.id,
            role: addedBy.role,
          }
        : undefined,
      targetId: userId,
      targetType: "user",
      ip,
      status: "SUCCESS",
      details,
    });
  } catch (err) {
    console.log("Activity Log Error:", err.message);
  }
};
