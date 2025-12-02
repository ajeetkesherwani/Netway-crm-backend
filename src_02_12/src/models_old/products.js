const mongoose = require("mongoose");
const variantSchema = new mongoose.Schema({
  VariantTypeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "VariantType",
    required: true,
  },
  value: { type: [String], required: true },
});

const productSchema = new mongoose.Schema(
  {
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
    },
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      required: true,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    subCategoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    fabricId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Fabric",
      // required: true,
    },
    // variants: [variantSchema],
    // variants: { type: String, default: "" },
    variants: [variantSchema],
    name: { type: String, required: true },
    primary_image: { type: String, required: true },
    gallery_images: [{ type: String, required: true }],
    price: { type: Number, required: true },
    discountedPrice: { type: Number },
    shortDiscription: { type: String, default: "" },
    longDiscription: { type: String, default: "" },
    tags: [{ type: String }],
    sku: { type: String, unique: true, required: true },
    returnAvailable: { type: Boolean, default: false },
    exchangeAvailable: { type: Boolean, default: false },
    isStock: { type: Boolean, default: true },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Products", productSchema);
