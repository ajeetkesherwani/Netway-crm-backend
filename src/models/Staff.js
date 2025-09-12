// models/Staff.js
const mongoose = require('mongoose');

const StaffSchema = new mongoose.Schema({
  logId: { type: String, required: true, unique: true },
  staffName: { type: String, required: true },
  salary: { type: Number },
  comment: { type: String },
  area: { type: String },
  staffIp: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Staff', StaffSchema);
