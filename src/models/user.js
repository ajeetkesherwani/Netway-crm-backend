const mongoose = require('mongoose');
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema(
  {
    generalInformation: {
      title: {
        type: String,
        enum: ["M/s", "Mr", "Ms", "Mrs", "Miss"],
        default: "M/s",
      },
      name: { type: String },
      billingName: { type: String },
      username: { type: String },
      password: { type: String },
      plainPassword: { type: String },
      email: { type: String },
      phone: { type: String },
      alternatePhone: { type: String },
      ipactId: { type: String },
      connectionType: {
        type: String,
        enum: ["ill", "ftth", "rf", "other"],
        default: "other",
      },
      selsExecutive: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Staff",
      },
      installationBy: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Staff",
        },
      ],
      installationByName: { type: String, default: null },
      ipAdress: { type: String },
      ipType: { type: String, default: "static" },
      //  ipType: { type: String, enum: ["static", "dynamic"], default: "static" },
      serialNo: { type: String },
      macId: { type: String },
      serviceOpted: {
        type: String,
        enum: ["intercom", "broadband", "corporate"],
        default: "intercom",
      },
      stbNo: { type: String },
      vcNo: { type: String },
      circuitId: { type: String },
      roleId: { type: mongoose.Schema.Types.ObjectId, ref: "Role" },
      telephone: { type: String },
      cafNo: { type: String },
      gst: { type: String },
      adharNo: { type: String },
      address: { type: String },
      pincode: { type: String },
      state: { type: String },
      country: { type: String },
      district: { type: String },
      paymentMethod: {
        type: String,
        enum: ["Cash", "Online"],
        default: "Cash",
      },

      createdBy: {
        id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        type: { type: String, enum: ["Admin", "Retailer", "Lco"] },
      },

      // Track for whom it was created
      createdFor: {
        id: { type: mongoose.Schema.Types.ObjectId, refPath: "generalInformation.createdFor.type" },
        type: { type: String, enum: ["Admin", "Retailer", "Lco", "Self", "Reseller"], }
      },

      paymentMethod: {
        type: String,
        enum: ["Cash", "Online"],
        default: "Cash",
      },
      otp: {
        code: String,
        expiresAt: Date,
      },
    },
    addressDetails: {
      billingAddress: {
        addressine1: { type: String },
        addressine2: { type: String },
        city: { type: String },
        state: { type: String },
        pincode: { type: String },
      },
      permanentAddress: {
        addressine1: { type: String },
        addressine2: { type: String },
        city: { type: String },
        state: { type: String },
        pincode: { type: String },
      },
      installationAddress: {
        addressine1: { type: String },
        addressine2: { type: String },
        city: { type: String },
        state: { type: String },
        pincode: { type: String },
      },
      area: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Zone",
      },
      subZone: { type: mongoose.Schema.Types.ObjectId,
       ref: "SubZone" },
    },

    packageInfomation: {
      packageId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Package",
      },
      packageName: { type: String },
      price: { type: String },
    },

    networkInformation: {
      networkType: {
        type: String,
        enum: ["PPPOE", "PPOE", "IP-Pass throw", "MAC_TAL", "ILL"],
      },
      // ipType: { type: String, enum: ["Static IP", "Dynamic IP Pool"] },
      ipType: { type: String },
      statisIp: {
        nas: { type: [String], enum: [""], default: "" },
        category: { type: String, enum: [""], default: "" },
      },
      dynamicIpPool: { type: String, enum: [""], default: "" },
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
        documentType: {
          type: String,
          enum: [
            "Address Proof",
            "Profile Photo",
            "Addhar Card",
            "Passport",
            "Signature",
            "Pan Card",
            "Driving Licence",
            "GST",
            "Caf Form",
            "Other",
          ],
          default: "Other",
        },
        documentImage: { type: [String], default: [] },
      },
    ],
    status: {
      type: String,
      enum: ["active", "Inactive", "Suspend", "Terminated"],
      default: "Inactive",
    },
    walletBalance: { type: Number, default: 0 },
    creditBalance: { type: Number, default: 0 },
    isAutoRecharge: { type: Boolean, default: false },
    assignedHardware: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Hardware",
      },
    ],
  },
  { timestamps: true }
);


UserSchema.pre("save", async function (next) {
  try {
    if (!this.isModified("generalInformation.password")) {
      return next();
    }

    const hashedPassword = await bcrypt.hash(this.generalInformation.password, 12);
    this.generalInformation.password = hashedPassword;

    next();
  } catch (err) {
    next(err);
  }
});

const User = mongoose.model("User", UserSchema);

module.exports = User;
