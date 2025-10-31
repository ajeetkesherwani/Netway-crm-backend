const mongoose = require("mongoose");

const orderAddressSchema = new mongoose.Schema({
  fullName: String,
  mobileNumber: String,
  addressLine1: String,
  addressLine2: String,
  landmark: String,
  city: String,
  state: String,
  country: String,
  pincode: String,
  latitude: String,
  longitude: String,
});

module.exports = mongoose.model("OrderAddress", orderAddressSchema);
