const mongoose = require("mongoose");

const refundAccountSchema = new mongoose.Schema({
  bankName: { type: String, required: true },
  branchName: { type: String, required: true },
  ifscCode: { type: String, required: true },
  accountNo: { type: String, required: true },
  holderName: { type: String, required: true },
});

const RefundAccount = mongoose.model("RefundAccount", refundAccountSchema);

module.exports = RefundAccount;
