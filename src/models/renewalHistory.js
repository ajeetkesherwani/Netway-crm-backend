const mongoose = require("mongoose");
const { Schema } = mongoose;

const renewalHistorySchema = new Schema(
  {
    purchasedPlanId: {
      type: Schema.Types.ObjectId,
      ref: "PurchasedPlan",
      required: true
    },

    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    packageId: {
      type: Schema.Types.ObjectId,
      ref: "Package",
      required: true
    },

    renewedOn: {
      type: Date,
      default: Date.now
    },

    previousExpiryDate: {
      type: Date,
      required: true
    },

    newExpiryDate: {
      type: Date,
      required: true
    },

    amountPaid: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      enum: ["pending", "active", "failed"],
      default: "pending"
    },

    paymentDetails: {
      date: { type: Date, default: null },
      method: {
        type: String,
        enum: ["Online", "Cash", "Upi", "Wallet", "Other"],
        default: "Cash"
      },
      amount: { type: Number, default: 0 },
      remark: { type: String, default: "" }
    },

    advanceRenewal: {
      type: Boolean,
      default: true
    },

    isPaymentReceived: {
      type: Boolean,
      default: false
    },

    isRefundable: {
      type: Boolean,
      default: true
    },

    remarks: {
      type: String,
      default: ""
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("RenewalHistory", renewalHistorySchema);
