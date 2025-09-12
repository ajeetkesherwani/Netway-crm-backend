const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  password: String,
  email: String,
  phone: String,
  role: { type: mongoose.Schema.Types.ObjectId, ref: 'Role' },
  staffData: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff' }, // Optional
  // Add any shared fields here
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
