
const mongoose = require("mongoose");

const paymentModeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    createdByRole: {
      type: String,
      required: true,
      trim: true,
    },

    status: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("PaymentMode", paymentModeSchema);
