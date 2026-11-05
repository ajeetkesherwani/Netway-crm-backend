const mongoose = require("mongoose");

const planPaymentSchema = new mongoose.Schema(
  {
    orderId: { type: String, required: true, unique: true, index: true },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    packageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Package",
      required: true,
    },
    amount: { type: Number, required: true, min: 0.01 },
    status: {
      type: String,
      enum: ["Pending", "Processing", "Paid", "Failed"],
      default: "Pending",
      required: true,
    },
    gatewayTrackingId: { type: String },
    gatewayOrderStatus: { type: String },
    purchasedPlanId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PurchasedPlan",
    },
    processedAt: { type: Date },
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.PlanPayment ||
  mongoose.model("PlanPayment", planPaymentSchema);
