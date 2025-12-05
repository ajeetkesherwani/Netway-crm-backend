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
  },

  packageName: {
    type: String,
  },
    validity: {
        number: { type: Number, }, // Enter number
        unit: { type: String, enum: ["Day", "Week", "Month", "Year"], default: "Day"} // Dropdown selection
    },
  basePrice: {
    type: Number,
  },
  // cutomPrice: {
  //   type: Number,
  // },
   customPrice:{type:  Number },
  status: {
    type: String,
    enum: ["active", "expired", "inactive"],
    default: "active"
  },

}, { timestamps: true });


module.exports = mongoose.model("UserPackage", UserPackageSchema);
