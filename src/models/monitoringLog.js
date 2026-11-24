const mongoose = require("mongoose");

const monitoringLogSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["activity", "sms", "whatsapp"],
      required: true,
      index: true,
    },
    action: { type: String, required: true },
    module: { type: String },
    description: { type: String },
    actorId: { type: String, index: true },
    actorName: { type: String },
    actorRole: { type: String },
    targetId: { type: String },
    targetName: { type: String },
    targetType: { type: String },
    ip: { type: String },
    requestId: { type: String, index: true },
    method: { type: String },
    path: { type: String },
    status: { type: String, index: true },
    statusCode: { type: Number },
    durationMs: { type: Number },
    channel: { type: String },
    recipient: { type: String },
    templateName: { type: String },
    message: { type: String },
    provider: { type: String },
    providerMessageId: { type: String },
    details: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true },
);

monitoringLogSchema.index({ type: 1, createdAt: -1 });
monitoringLogSchema.index({ actorId: 1, createdAt: -1 });
monitoringLogSchema.index({ recipient: 1, createdAt: -1 });

module.exports =
  mongoose.models.MonitoringLog ||
  mongoose.model("MonitoringLog", monitoringLogSchema);
