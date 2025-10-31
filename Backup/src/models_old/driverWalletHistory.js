const mongoose = require("mongoose");

const driverWalletSchema = new mongoose.Schema({

  driverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Driver",
    required: true
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SubOrder",
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  type: {
    type: String,
    enum: ["credit", "debit"],
    default: "credit"
  },
  reason: {
    type: String,
    enum: [
      'order_payment',
      'refund',
      'withdrawal',
      'manual_credit',
      'manual_debit',
      'adjustment',
      'commission',
      'other'
    ],
    default: 'other'
  },
  commission: {
    type: Number,
    default: 0,
  },
  totalAmount: {
    type: Number,
  },
  balance_after_transaction: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ["pending", "completed"],
    default: "pending"
  },
  description: {
    type: String,
    default: ""
  }
}, { timestamps: true });

const DriverWalletHistory = mongoose.model("DriverWalletHistory", driverWalletSchema);

module.exports = DriverWalletHistory