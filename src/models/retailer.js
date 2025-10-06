const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const retailerSchema = new mongoose.Schema({

  title: {
    type: String,
    enum: ["Mr.", "Ms", "M/s", "Mrs", "Miss"],
    default: "M/s"
  },
  phoneNo: { type: Number, match: /^[0-9]{10}$/ },
  email: { type: String },
  password: { type: String},
  resellerName: { type: String},
  houseNo: { type: String },
  pincode: { type: String },
  area: { type: String },
  subArea: { type: String },
  mobileNo: { type: Number},
  fax: { type: String },
  messengerId: { type: String },
  dob: { type: String },
  balance: { type: String },
  dashboard: { type: String, enum: ["Admin", "Reseller", "Manager"], default: "Admin" },
  panNumber: { type: String },
  resellerCode: { type: String },
  contactPersonNumber: { type: String },
  whatsAppNumber: { type: String },
  address: { type: String },
  taluka: { type: String },
  state: { type: String},
  country: { type: String },
  website: { type: String },
  annversaryDate: { type: String },
  latitude: { type: String },
  longitude: { type: String },
  gstNo: { type: String },
  contactPersonName: { type: String },
  supportEmail: { type: String },
  nas: { type: [String], default: [], },
  Description: { type: String },
  role: { type: mongoose.Schema.Types.ObjectId, ref: "Role"},
  status: { type: String, default: "false" },
  walletBalance: { type: Number, default: 0 },
  creditBalance: { type: Number, default: 0 },
  employeeAssociation: {
    type: {
      type: String,
      enum: ["Admin", "Manager", "Operator"],
      default: "Admin"
    },
    status: {
      type: String,
      enum: ["active", "Inactive"],
      default: "Inactive"   // ✅ FIXED: changed from array to string
    },
    employeeName: { type: String },
    employeeUserName: { type: String },
    password: { type: String },
    mobile: { type: Number },
    email: { type: String }
  }
}, { timestamps: true });


// Before saving retailer
retailerSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Method to compare passwords
retailerSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const Retailer = mongoose.model("Retailer", retailerSchema);

module.exports = Retailer;