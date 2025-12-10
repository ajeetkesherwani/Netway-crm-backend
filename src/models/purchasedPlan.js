const mongoose = require("mongoose");
const { Schema } = mongoose;

const renewalSchema = new Schema({
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
  transactionId: {
    type: String
  },
  paymentMethod: {
    type: String,
    enum: ["Online", "Cash", "Upi", "Wallet", "Other"],
    default: "Online"
  },

  paymentDetails: {
    date: { type: Date, default: null },
    method: {
      type: String,
      enum: ["Cash", "UPI", "Bank Transfer", "Cheque", "Online", "Wallet"],
      default: "Cash"
    },
    amount: { type: Number, default: 0 },
    remark: { type: String, default: "" }
  },

  remarks: String
}, { _id: false });

const purchasedPlanSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  purchasedByRole: {
    type: String,
    enum: ["Admin", "Reseller", "Lco", "User"],
    default: "User"
  },
  purchasedById: {
    type: Schema.Types.ObjectId,
    required: true,
    refPath: "purchasedByRole"
  },
  packageId: {
    type: Schema.Types.ObjectId,
    ref: "Package",
    required: true
  },
  purchaseDate: {
    type: Date,
    default: Date.now
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  expiryDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ["active", "expired", "cancelled", "pending", "Inactive"],
    default: "active"
  },
  amountPaid: {
    type: Number,
    required: true
  },
  transactionId: {
    type: String
  },
  paymentMethod: {
    type: String,
    enum: ["Online", "Cash", "Wallet", "Other"],
    default: "Online"
  },
  remarks: String,

  // 🔥 New fields for renewals
  isRenewed: {
    type: Boolean,
    default: false
  },
  paymentDetails: {
    type: {
      date: { type: Date, default: null },
      method: {
        type: String,
        enum: ["Cash", "UPI", "Bank Transfer", "Cheque", "Online", "Wallet"],
        default: "Cash"
      },
      amount: { type: Number, default: 0 },
      remark: { type: String, default: "" }
    },
    default: null 
  },

  renewals: [renewalSchema],
  isPaymentRecived: {
    type: Boolean, default: false
  }

}, { timestamps: true });

module.exports = mongoose.model("PurchasedPlan", purchasedPlanSchema);
