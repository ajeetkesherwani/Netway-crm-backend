const mongoose = require("mongoose");

const ActivityLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  type: { type: String, required: true },
  description: { type: String, required: true },
  details: { type: Object },               // optional extra info
  ip: { type: String },
  addedBy: {
    id: { type: mongoose.Schema.Types.ObjectId, required: true }, 
    role: { type: String, required: true }
  }
}, { timestamps: true });

module.exports = mongoose.model("ActivityLog", ActivityLogSchema);
