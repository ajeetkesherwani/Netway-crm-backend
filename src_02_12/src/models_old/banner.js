const mongoose = require("mongoose");
const { Schema } = mongoose;

const bannerSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    serviceId: { type: Schema.Types.ObjectId, ref: "Service" },
    section: {
      type: String,
      // enum: ["home", "offer", "buy 1 get 1 free", "night cafe", "199 store", "everyday"],
      required: true,
    },
    image: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Banner", bannerSchema);
