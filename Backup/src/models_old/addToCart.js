const mongoose = require("mongoose");

const addToCartSchema = new mongoose.Schema(
  {
    user_Id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    product_Id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Products",
      required: true,
    },
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    variants: [
      {
        variantTypeId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "VariantType",
          required: true,
        },
        value: {
          type: String,
          required: true,
        },
      },
    ],
    basePrice: {
      type: Number,
      required: true,
    },
    addOnPrice: {
      type: Number,
      default: 0,
    },
    finalPrice: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("AddToCart", addToCartSchema);
