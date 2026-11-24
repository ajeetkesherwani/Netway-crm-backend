const { recordMonitoringLog } = require("../services/monitoringLogService");

const requestLogger = (req, res, next) => {
  const startedAt = Date.now();

  res.once("finish", () => {
    if (!req.originalUrl.startsWith("/api/")) return;

    const path = req.originalUrl.split("?")[0];
    const parts = path.split("/").filter(Boolean);

    recordMonitoringLog({
      type: "activity",
      action: `${req.method} ${path}`,
      module: parts[2] || parts[1] || "api",
      description: `${req.method} ${path} returned ${res.statusCode}.`,
      actor: req.user
        ? {
            id: req.user._id,
            name: req.user.name,
            role: req.user.roleName || req.user.role,
          }
        : undefined,
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
