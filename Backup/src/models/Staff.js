// models/Staff.js
const mongoose = require('mongoose');
const bcrypt = require("bcryptjs");

const staffSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phoneNo: { type: String, required: true, match: /^[0-9]{10}$/ },
  password: { type: String, required: true },
  resetOtpExpires: { type: String, required: false },
  address: { type: String, required: false },
  resetOtpExpires: { type: Date },
  bio: { type: String, required: false },
  role: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Role",
    required: true
  },
  logId: { type: String, required: true, unique: true },
  staffName: { type: String, required: true },
  salary: { type: Number },
  comment: { type: String },
  area: { type: String },
  staffIp: { type: String },
  status: { type: String, default: "false" }
}, { timestamps: true });

// Before saving staff
staffSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Method to compare passwords
staffSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};


const Staff = mongoose.model('Staff', staffSchema);

module.exports = Staff;
