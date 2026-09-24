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
      name: { type: String, required: [true, "Name is required"] },
      billingName: { type: String },
      username: { type: String },
      UserId: { type: String, required: [true, "User ID is required"] },
      gender: {
        type: String,
        enum: ["Male", "Female", "Other"],
        default: "Male",
      },
      password: { type: String, required: [true, "Password is required"] },
      plainPassword: { type: String },
      email: { type: String, required: [true, "Email is required"] },
      phone: { type: String, required: [true, "Mobile number is required"] },
      alternatePhone: { type: String },
      ipactId: { type: String },
      ipacctCustomerId: { type: String },
      serverType: { type: String, default: null },
      connectionType: {
        type: String,
        enum: ["ill", "ftth", "rf", "other"],
        default: "other",
        required: [true, "Connection type is required"],
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
      pool: { type: String },
      ipType: { type: String, default: "static" },
      //  ipType: { type: String, enum: ["static", "dynamic"], default: "static" },
      serialNo: { type: String },
      macId: { type: String },
      serviceOpted: {
        type: String,
        enum: ["intercom", "broadband", "corporate", "coporate"],
        default: "broadband",
        required: [true, "Service opted is required"],
      },
      stbNo: { type: String },
      vcNo: { type: String },
      circuitId: { type: String },
      roleId: { type: mongoose.Schema.Types.ObjectId, ref: "Role" },
      telephone: { type: String },
      cafNo: { type: String },
      gst: { type: String },
      adharNo: { type: String },
      panNumber: { type: String },
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
        addressine1: { type: String, required: [true, "Address Line 1 is required"] },
        addressine2: { type: String },
        city: { type: String, required: [true, "City is required"] },
        state: { type: String, required: [true, "State is required"] },
        pincode: { type: String, required: [true, "Pincode is required"] },
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
        required: [true, "Area is required"],
      },
      subZone: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "SubZone",
        required: [true, "Zone is required"],
      },
    },

    packageInfomation: [
      {
        packageId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Package",
        },
        packageName: { type: String },
        price: { type: String },
      },
    ],

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
      dynamicIpPool: { type: String, default: "" },
    },

    additionalInformation: {
      dob: { type: String, required: [true, "Date of birth is required"] },
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


UserSchema.pre("validate", function (next) {
  if (this.isNew || this.isModified("generalInformation")) {
    const hasInstaller =
      (Array.isArray(this.generalInformation?.installationBy) &&
        this.generalInformation.installationBy.length > 0) ||
      Boolean(this.generalInformation?.installationByName?.trim());

    if (!hasInstaller) {
      this.invalidate(
        "generalInformation.installationBy",
        "Installation By is required"
      );
    }
  }

  if (this.isNew || this.isModified("packageInfomation")) {
    if (
      !Array.isArray(this.packageInfomation) ||
      this.packageInfomation.length === 0
    ) {
      this.invalidate(
        "packageInfomation",
        "At least one package is mandatory"
      );
    }
  }

  next();
});

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
