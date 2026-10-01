const mongoose = require("mongoose");

const loginOtpSchema = new mongoose.Schema({
  otp: {
    type: String,
    required: true,
  },
  mobileSentTo: {
    type: String,
    required: true,
  },
  cleanUser: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  userType: {
    type: String,
    required: true,
  },
  employee: {
    type: mongoose.Schema.Types.Mixed,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 600, // Automatically deletes the document after 10 minutes (600 seconds)
  }
});

module.exports = mongoose.model("LoginOtp", loginOtpSchema);
