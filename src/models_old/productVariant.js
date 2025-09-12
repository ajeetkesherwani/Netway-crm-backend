const mongoose = require("mongoose");

const productVariantSchema = new mongoose.Schema(
  {
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      required: true,
    },

    variantTypeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "VariantType",
      required: true,
    },
    variants: [String],
  },
  { timestamps: true }
);

const ProductVariant = mongoose.model("ProductVariant", productVariantSchema);

module.exports = ProductVariant;
