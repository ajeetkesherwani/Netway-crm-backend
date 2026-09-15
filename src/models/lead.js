const mongoose = require("mongoose");

const DOCUMENT_TYPES = [
  "Profile Photo",
  "Addhar Card",
  "Pan Card",
  "Address Proof",
  "GST",
  "Driving Licence",
  "Passport",
  "Signature",
  "Other",
];

const documentSchema = new mongoose.Schema(
  {
    documentType: {
      type: String,
      enum: DOCUMENT_TYPES,
      required: true,
    },
    files: [
      {
        type: String, // file path / URL
      },
    ],
  },
  { _id: false }
);

const leadSchema = new mongoose.Schema(
  {
    // ── Lead Number ─────────────────────────────────────────────────────────
    leadNumber: {
      type: String,
      unique: true,
    },

    // ── Contact Info ─────────────────────────────────────────────────────────
    contactName: {
      type: String,
      required: true,
      trim: true,
    },
    contactNumber: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
    },
    company: {
      type: String,
      trim: true,
    },

    // ── Address ──────────────────────────────────────────────────────────────
    state: {
      type: String,
      trim: true,
    },
    district: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    area: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubZone",
      default: null,
    },
    zone: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Zone",
      default: null,
    },

    // ── Category ─────────────────────────────────────────────────────────────
    category: {
      type: String,
      enum: ["New Connection Request"],
      default: "New Connection Request",
    },

    // ── Service Info ─────────────────────────────────────────────────────────
    serviceRequired: {
      type: String,
      trim: true,
    },

    // ── Documents ────────────────────────────────────────────────────────────
    documents: [documentSchema],

    // ── Call Info ────────────────────────────────────────────────────────────
    callSource: {
      type: String,
      enum: ["Phone", "Email", "Web", "Walk-in", "Other", "MobileApp"],
      default: "Phone",
    },
    severity: {
      type: String,
      enum: ["Low", "Medium", "High", "Critical"],
      default: "Medium",
    },
    description: {
      type: String,
      trim: true,
    },

    // ── Assignment ───────────────────────────────────────────────────────────
    assignToId: [{
      type: mongoose.Schema.Types.ObjectId,
      refPath: "assignToModel"
    }],
    assignToModel: {
      type: String,
      enum: ["Admin", "Reseller", "Lco", "Staff"],
      default: null,
    },

    // ── Stage ────────────────────────────────────────────────────────────────
    stage: {
      type: String,
      enum: ["New", "Contacted", "Qualified", "Converted", "Lost"],
      default: "New",
    },

    // ── Audit Fields ─────────────────────────────────────────────────────────
    createdById: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "createdByType",
      required: true,
    },
    createdByType: {
      type: String,
      enum: ["Admin", "Reseller", "Lco", "Staff"],
      required: true,
    },

    // ── Relations ────────────────────────────────────────────────────────────
    lcoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lco",
      default: null,
    },
    resellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Retailer",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Auto-generate lead number before saving
leadSchema.pre("save", async function (next) {
  if (!this.leadNumber) {
    const randomNum = Math.floor(10000000 + Math.random() * 90000000);
    this.leadNumber = `LEAD${randomNum}`;
  }
  next();
});

const Lead = mongoose.models.Lead || mongoose.model("Lead", leadSchema);
module.exports = Lead;
