const MonitoringLog = require("../models/monitoringLog");
const { getRequestContext } = require("../middleware/requestContext");
const { sanitizeLogData, sanitizeMessage } = require("../utils/sanitizeLogData");

const recordMonitoringLog = async (entry) => {
  const context = getRequestContext();
  const req = context?.req;
  const actor = { ...(req?.user || {}), ...(entry.actor || {}) };
  const actorId = entry.actorId || actor.id || actor._id || actor.userId;
  const actorName = entry.actorName || actor.name || actor.actorName;
  const actorRole =
    entry.actorRole || actor.roleName || actor.role || actor.actorRole;

  const log = await MonitoringLog.create({
    type: entry.type,
    action: entry.action,
    module: entry.module,
    description: entry.description,
    actorId: actorId ? String(actorId) : undefined,
    actorName,
    actorRole: typeof actorRole === "string" ? actorRole : undefined,
    targetId: entry.targetId ? String(entry.targetId) : undefined,
    targetName: entry.targetName,
    targetType: entry.targetType,
    ip: entry.ip || req?.ip,
    requestId: entry.requestId || context?.requestId,
    method: entry.method || req?.method,
    path: entry.path || req?.originalUrl?.split("?")[0],
    status: entry.status,
    statusCode: entry.statusCode,
    durationMs: entry.durationMs,
    channel: entry.channel,
    recipient: entry.recipient ? String(entry.recipient) : undefined,
    templateName: entry.templateName,
    message: sanitizeMessage(entry.message, entry.isAuthentication),
    provider: entry.provider,
    providerMessageId: entry.providerMessageId
      ? String(entry.providerMessageId)
      : undefined,
    details: sanitizeLogData(entry.details),
  });

  if (entry.isBusinessActivity && req) {
    req.hasBusinessActivityLog = true;
  }

  return log;
};

module.exports = { recordMonitoringLog };
