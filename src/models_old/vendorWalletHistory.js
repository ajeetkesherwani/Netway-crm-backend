const mongoose = require("mongoose");

const vendorWalletSchema = new mongoose.Schema({
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Vendor",
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
    required: true
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
    default: 'order_payment'
  },
  status: {
    type: String,
    enum: ["pending", "settled", ],
    default: "pending"
  },
  commission: {
    type: Number,
    default: 0,
  },
  totalAmount: {
    type: Number
  },
  balance_after_transaction: {
    type: Number,
    required: true
  },
  description:{
    type: String,
    default: ""
  }
}, { timestamps: true });

const VendorWallet = mongoose.model("VendorWallet", vendorWalletSchema);

module.exports = VendorWallet;