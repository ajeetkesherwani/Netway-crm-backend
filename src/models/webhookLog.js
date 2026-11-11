const mongoose = require("mongoose");

const webhookLogSchema = new mongoose.Schema(
  {
    source:     { type: String, required: true, index: true },   // e.g. 'ccavenue', 'razorpay'
    event:      { type: String, index: true },                   // last event: 'payment.initiated' | 'payment.callback' | 'payment.status_check'
    status: {
      type: String,
      enum: ["processed", "ignored", "failed", "duplicate", "Pending", "Processing", "Paid", "Failed"],
      default: "Pending",
      index: true,
    },
    orderId:    { type: String, index: true, unique: true },     // ONE document per order
    paymentId:  { type: String },                                // gateway tracking/reference ID
    purchaseId: { type: mongoose.Schema.Types.Mixed },           // purchasedPlanId once activated
    payload:    { type: mongoose.Schema.Types.Mixed },           // full raw payload (JSON)
    error:      { type: String },                                // error message if failed
    ip:         { type: String },
  },
  { timestamps: true }
);

// Auto-expire logs after 90 days
webhookLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 90 });

module.exports =
  mongoose.models.WebhookLog ||
  mongoose.model("WebhookLog", webhookLogSchema);
