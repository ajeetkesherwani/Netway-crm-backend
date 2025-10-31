const mongoose = require("mongoose");

const vendorSchema = new mongoose.Schema({
  // SHOP DETAILS
  shopName: { type: String },
  shopId: { type: String, default: "" },
  serviceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Service",
  },
  shopNumber: { type: String, default: "" },
  shopAddress: { type: String, default: "" },
  city: { type: String, default: "" },
  landmark: { type: String, default: "" },
  pinCode: { type: String, default: "" },
  mobile: { type: String },
  profileImg: { type: String, default: "" },
  shopImages: { type: [String], default: [] },

  // BUSINESS DETAILS
  isGstRegistered: { type: Boolean, default: false },
  gstNo: { type: String, default: "0" },
  ownerName: { type: String, default: "" },
  email: { type: String, default: "" },
  panNo: { type: String, default: "0" },
  fullNameOnPan: { type: String, default: "" },
  panImages: { type: [String], default: [] },

  // BANK DETAILS
  accountNo: { type: String, default: "" },
  ifsc: { type: String, default: "" },
  bankName: { type: String, default: "" },
  holderName: { type: String, default: "" },
  accountType: { type: String, default: "" },

  // DIGITAL SIGNATURE
  digitalSignature: { type: String, default: "" },

  // OTHERS
  shopOpeningTime: { type: String, default: "10:00 AM" },
  shopClosingTime: { type: String, default: "09:00 PM" },
  rating: { type: Number, default: 0 },
  otp: { type: String, default: "" },
  otpExpires: { type: Date, default: Date.now },
  commission: { type: Number, default: 0 },
  wallet_balance: { type: Number, default: 0 },
  isBlocked: { type: Boolean, default: false },
  agreementAccepted: { type: String, default: "true" },
  status: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

const Vendor = mongoose.model("Vendor", vendorSchema);
module.exports = Vendor;
