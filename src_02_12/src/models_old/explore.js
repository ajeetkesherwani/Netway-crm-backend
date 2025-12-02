// models/Explore.js
const mongoose = require("mongoose");

const exploreSchema = new mongoose.Schema(
  {
    name: { type: String, required: ["true", "Name is required"] },
    icon: { type: String, required: ["true", "Icon is required"] },
    serviceId: { type: mongoose.Schema.Types.ObjectId, ref: "Service" },
    bannerImg: { type: String, required: ["true", "Banner Image is required"] },
    couponCode: { type: String, required: ["true", "Coupon Code is required"] },
    sections: [{ type: mongoose.Schema.Types.ObjectId, ref: "ExploreSection" }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Explore", exploreSchema);
