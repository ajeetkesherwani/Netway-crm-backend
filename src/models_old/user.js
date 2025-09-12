const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true },
    mobileNo: {
      type: String,
      required: [true, "Mobile number is required"],
      unique: true,
      trim: true,
    },
    email: { type: String, trim: true, lowercase: true },
    profileImage: { type: String, default: "" },

    userType: {
      type: String,
      enum: ["veg", "nonveg", "other"],
      default: "other",
    },

    gender: {
      type: String,
      enum: ["male", "female", "other"],
      default: "other",
    },
    dob: { type: Date },
    status: { type: Boolean, default: true },
    otp: { code: String, expiresAt: Date },
    lastLogin: { type: Date },
    isVerified: { type: Boolean, default: false },
    lat: { type: String, default: "" },
    long: { type: String, default: "" },
    deviceInfo: { deviceId: String, deviceModel: String, osVersion: String },

    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number] },
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);
module.exports = User;
