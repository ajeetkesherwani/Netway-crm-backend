const mongoose = require("mongoose");

const bannerSchema = new mongoose.Schema(
  {
    bannerName: { type: String, required: true },
    bannerType: { type: String, enum: ["Web", "App"], required: true },
    reseller: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
    fromDate: { type: Date },
    toDate: { type: Date },
    short: { type: Number, default: 0 },
    file: { type: String }, // URL or path to the file/image
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    isDeleted: { type: Boolean, default: false }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Banner", bannerSchema);
