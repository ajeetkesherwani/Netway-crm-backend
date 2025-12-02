const mongoose = require('mongoose');

const WebUserSchema = new mongoose.Schema({
  fullName: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    sparse: true // allows nulls but enforces uniqueness if value exists
  },
  password: {
    type: String,
    default: null
  },
  address: {
    street: { type: String },
    city: { type: String },
    state: { type: String },
    postalCode: { type: String },
    country: { type: String }
  },
  profileImage: {
    type: String // URL or file path
  },
  isActive: {
    type: Boolean,
    default: true
  },
  walletBalance: {
    type: Number,
    default: 0
  },
  lastLogin: {
    type: Date
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('WebUser', WebUserSchema);
