const { recordMonitoringLog } = require("../services/monitoringLogService");

const logMonitoringActivity = async ({
  req,
  action,
  module,
  description,
  targetId,
  targetName,
  targetType,
  details,
  actor: actorOverride,
}) => {
  const actor = actorOverride || req?.user || req?.driver || req?.vendor;
  const actorRole =
    actor?.roleName ||
    actor?.role ||
    (actor === req?.driver ? "Driver" : actor === req?.vendor ? "Vendor" : undefined);

  try {
    await recordMonitoringLog({
      type: "activity",
      isBusinessActivity: true,
      action,
      module,
      description,
      actorId: actor?._id,
      actorName: actor?.name || actor?.driverName || actor?.vendorName,
      actorRole,
      targetId,
      targetName,
      targetType,
      ip: req?.ip || req?.headers?.["x-forwarded-for"],
      status: "SUCCESS",
      details,
    });
  } catch (error) {
    console.error("[Monitoring] Failed to save business activity:", error.message);
  }
};

module.exports = logMonitoringActivity;
