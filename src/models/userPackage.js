// models/UserPackage.js
const mongoose = require("mongoose");

const UserPackageSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
 billType: { type: String, enum: ["Monthly","Quarterly","HalfYear","Yearly","OneTime"], default: "Monthly" },
  packageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Package",
    required: true
  },

  packageName: {
    type: String,
    required: true
  },
    validity: {
        number: { type: Number, required: true }, // Enter number
        unit: { type: String, enum: ["Day", "Week", "Month", "Year"], required: true } // Dropdown selection
    },
  basePrice: {
    type: Number,
    required: true
  },
  cutomePrice: {
    type: Number,
  },
  status: {
    type: String,
    enum: ["active", "expired", "inactive"],
    default: "active"
  },

}, { timestamps: true });


module.exports = mongoose.model("UserPackage", UserPackageSchema);
