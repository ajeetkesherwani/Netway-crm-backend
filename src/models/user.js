const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  generalInformation: {
    title: { type: String, enum: ["M/s", "Mr", "Ms", "Mrs", "Miss"], default: "M/s" },
    name: { type: String },
    billingName: { type: String },
    username: { type: String, required: true },
    password: { type: String },
    plainPassword: { type: String },
    email: { type: String },
    phone: { type: String },
    alternatePhone: { type: String },
    ipactId: { type: String},
    connectionType: { type: String, enum: ["iil", "ftth", "wireless", "other"], default: "other" },
    selsExecutive: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hardware"
    },
    installationBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Hardware"
      }
    ],
    installationByName: { type: String, default: null},
    ipAdress: { type: String},
    ipType: { type: String, enum: ["static", "dynamic"], default: "static" },
    serialNo: { type: String},
    macId: { type: String},
    serviceOpted: { type: String, enum: ["intercom", "broadBand","coporate"], default: "intercom" },
    stbNo: { type: String},
    vcNo: { type: String},
    circuitId: { type: String},
    roleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Role' },
    telephone: { type: String },
    cafNo: { type: String },
    gst: { type: String },
    adharNo: { type: String },
    address: { type: String },
    pincode: { type: String },
    state: { type: String, required: true },
    country: { type: String },
    district: { type: String },
    paymentMethod: { type: String, enum: ["Cash", "Online"], default: "Cash" },

    createdBy: {
      id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
      type: { type: String, enum: ["Admin", "Retailer", "Lco"], required: true }
    },

    // Track for whom it was created
    createdFor: {
      id: { type: mongoose.Schema.Types.ObjectId, refPath: "generalInformation.createdFor.type" },
      type: { type: String, enum: ["Admin", "Retailer", "Lco", "Self"], required: true }
    },

    paymentMethod: {
      type: String,
      enum: ["Cash", "Online"],
      default: "Cash"
    }
  },
  addressDetails:{
    billingAddress : {
      addressine1: { type: String },
      addressine2: { type: String },
      city: { type: String },
    },
    permanentAddress : {
      addressine1: { type: String },
      addressine2: { type: String },
      city: { type: String },
    },
    installationAddress : {
      addressine1: { type: String },
      addressine2: { type: String },
      city: { type: String },
    },
    area: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Zone"
    },
  },

  packageInfomation: {
    packageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Package"
    },
    packageName: { type: String },
    price: { type: String },

  },

  networkInformation: {
    networkType: { type: String, enum: ["PPPOE", "PPOE", "IP-Pass throw", "MAC_TAL", ". ILL"] },
    ipType: { type: String, enum: ["Static IP", "Dynamic IP Pool"] },
    statisIp: {
      nas: { type: [String], enum: [""], default: "" },
      category: { type: String, enum: [""], default: "" }
    },
    dynamicIpPool: { type: String, enum: [""], default: "" }
  },

  additionalInformation: {
    dob: { type: String },
    description: { type: String },
    ekyc: { type: String, enum: ["yes", "no"], default: "no" },
    notification: { type: Boolean, default: "false" },
    addPlan: { type: Boolean, default: "false" },
    addCharges: { type: Boolean, default: "false" },
  },

  document: [
    {
      documentType: { type: String, enum: ["ID proof", "Profile Id", "Adhar Card", "Insurence Paper", "Signature", "Other"], default: "Other" },
      documentImage: { type: String, default: "" }
    }
  ],
  status: { type: String, enum: ["active", "Inactive", "Suspend", "Terminated"], default: "Inactive" },
  walletBalance: { type: Number, default: 0 },
  assignedHardware: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hardware"
    }
  ]
}, { timestamps: true });

const User = mongoose.model("User", UserSchema);

module.exports = User;