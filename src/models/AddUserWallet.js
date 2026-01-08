const mongoose = require("mongoose");

const AddUserWalletSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    totalAmount: {
      type: Number,
    },
    paymentDate: {
      type: Date,
      default: Date.now
    },
    amountToBePaid: {
      type: Number,
    },
    fullPaid: {
      type: Boolean,
      default: false
    },
    dueAmount: {
      type: Number,
    },
    paymentMode: {
      type: String,
      enum: ['Cash', 'Card', 'UPI', 'BankTransfer', 'Cheque', 'Other'], // you can modify as needed
      default: "Cash",
      required: true    
    },
    transactionNo: {
      type: String
    },
    comments: {
      type: String,
    },
    imageProof: {
      type: String,
      default: ""
    },
    sms: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

const AddUserWallet = mongoose.model("AddUserWallet", AddUserWalletSchema);

module.exports = AddUserWallet;