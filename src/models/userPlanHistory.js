const mongoose = require("mongoose");

const userPlanHistorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  planId: { type: mongoose.Schema.Types.ObjectId, ref: "Plan" },
  amount: { type: Number },
  paymentMethod: { type: String, enum: ["Cash", "Online"], default:"Online" },
  transactionId: { type: String },
  type: { type: String, enum: ["purchase", "renewal", "upgrade"] },
  desciption: { type: String},
}, { timestamps: true});

const UserPlanHistory = mongoose.model("UserPlanHistory", userPlanHistorySchema);
module.exports = UserPlanHistory;
