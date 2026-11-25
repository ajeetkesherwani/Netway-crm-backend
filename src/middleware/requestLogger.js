const { recordMonitoringLog } = require("../services/monitoringLogService");

const normalizeAuditValue = (value) => {
  if (Array.isArray(value)) return value.map(normalizeAuditValue);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [
        key,
        normalizeAuditValue(item),
      ]),
    );
  }
  if (typeof value === "string" && /^[\s]*[\[{]/.test(value)) {
    try {
      return normalizeAuditValue(JSON.parse(value));
    } catch {
      return "[UNPARSED JSON OMITTED]";
    }
  }
  return value;
};

const requestLogger = (req, res, next) => {
  const startedAt = Date.now();

  res.once("finish", () => {
    if (!req.originalUrl.startsWith("/api/")) return;
    if (!["POST", "PUT", "PATCH", "DELETE"].includes(req.method)) return;
    if (req.hasBusinessActivityLog) return;

    const path = req.originalUrl.split("?")[0];
    const parts = path.split("/").filter(Boolean);
    const params = req.params || {};
    const body = req.body || {};
    const targetCandidates = [
      ["user", params.userId || body.userId],
      ["ticket", params.ticketId || body.ticketId],
      ["package", params.packageId || body.packageId],
      ["hardware", params.hardwareId || body.hardwareId],
      ["purchasedPlan", params.planId || body.planId],
      ["userPackage", params.assignedPackageId],
      ["record", params.id || body.id || body._id],
    ];
    const target = targetCandidates.find(([, id]) => id);
    const auditBody = normalizeAuditValue(body);
    const actor = req.user || req.driver || req.vendor;

    recordMonitoringLog({
      type: "activity",
      action: `${req.method} ${path}`,
      module: parts[2] || parts[1] || "api",
      description: `${req.method} ${path} returned ${res.statusCode}.`,
      actor: actor
        ? {
            id: actor._id,
            name: actor.name || actor.driverName || actor.vendorName,
            role:
              actor.roleName ||
              actor.role ||
              (actor === req.driver ? "Driver" : actor === req.vendor ? "Vendor" : undefined),
          }
        : undefined,
      targetId: target?.[1],
      targetName:
        body.name ||
        body.packageName ||
        body.hardwareName ||
        body.personName ||
        body.customerName ||
        auditBody.customer?.name,
      targetType: target?.[0] || parts[2] || parts[1] || "api",
      details: {
        params: normalizeAuditValue(params),
        body: auditBody,
      },
      method: req.method,
      path,
      status: res.statusCode < 400 ? "SUCCESS" : "FAILED",
      statusCode: res.statusCode,
      durationMs: Date.now() - startedAt,
      requestId: req.requestId,
      ip: req.ip,
    }).catch((error) => {
      console.error("[Monitoring] Failed to save API activity:", error.message);
    });
  });

  next();
};

module.exports = requestLogger;
