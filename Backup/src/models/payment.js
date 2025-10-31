const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
  ReceiptNo: {
    type: String,
    required: true,
    unique: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WebUser', // assuming the user model is named 'User'
    required: true
  },
  totalAmount: {
    type: Number,
    required: true
  },
  amountToBePaid: {
    type: Number,
    required: true
  },
  dueAmount: {
    type: Number,
    default: 0
  },
  PaymentDate: {
    type: Date,
    default: Date.now
  },
  PaymentMode: {
    type: String,
    enum: ['Cash', 'Card', 'UPI', 'BankTransfer', 'Cheque', 'Other'], // you can modify as needed
    required: true
  },
  transactionNo: {
    type: String
  },
  comment: {
    type: String
  },
  paymentProof: {
    type: String // store file path or URL
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Completed', 'Failed', 'Refunded'], // you can modify as needed
    default: 'Pending'
    }
}, {
  timestamps: true
});

module.exports = mongoose.model('Payment', PaymentSchema);
