const Logs = require("../models/activity");
const { recordMonitoringLog } = require("../services/monitoringLogService");

const createLog = async ({ createdById, createdByRole, action, description = "" }) => {
  try {
    await Logs.create({
      createdById,
      createdByRole,
      action,
      description
    });
    await recordMonitoringLog({
      type: "activity",
      action,
      module: "business",
      description,
      actorId: createdById,
      actorRole: createdByRole,
      status: "SUCCESS",
    });
  } catch (error) {
    console.error("Log creation failed:", error.message);
  }
};

module.exports = createLog;
