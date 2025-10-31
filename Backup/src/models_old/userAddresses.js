const mongoose = require("mongoose");
const UserAddressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    fullName: { type: String, required: true },
    mobileNumber: { type: String, required: true },

    addressLine1: { type: String, required: true },
    addressLine2: { type: String },
    landmark: { type: String },

    city: { type: String, required: true },
    state: { type: String, required: true },
    country: { type: String, default: "India", required: true },
    pincode: { type: String, required: true },

    latitude: { type: Number },
    longitude: { type: Number },

    addressType: {
      type: String,
      enum: ["Home", "Work", "Other"],
      default: "Home",
    },

    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const UserAddesses = mongoose.model("UserAddesses", UserAddressSchema);
module.exports = UserAddesses;
