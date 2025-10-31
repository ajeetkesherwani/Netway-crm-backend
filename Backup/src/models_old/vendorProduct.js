const mongoose = require("mongoose");

const VendorProductSchema = new mongoose.Schema({
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Vendor",
    required: true,
  },
  shopId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Shop",
    required: true,
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },
  subCategoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SubCategory",
    required: true,
  },
  brandId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Brand",
    required: true,
  },
  serviceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Service",
  },
  sku: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    default: "",
  },
  primary_image: {
    type: String,
    required: true,
  },
  gallery_image: [
    {
      type: String,
      required: true,
    },
  ],
  name: {
    type: String,
    required: true,
  },
  mrp: {
    type: String,
    required: true,
  },
  vendorSellingPrice: {
    type: String,
    required: true,
  },
  unitOfMeasurement: {
    type: String,
    required: true,
  },
  sellingUnit: {
    type: String,
    required: true,
  },
  shortDescription: {
    type: String,
    required: true,
  },
  longDescription: {
    type: String,
  },

  isRecommended: { type: Boolean, default: false },
  isFeatured: { type: Boolean, default: false },
  isSeasonal: { type: Boolean, default: false },
  isVegetableOfTheDay: { type: Boolean, default: false },
  isFruitOfTheDay: { type: Boolean, default: false },
  status: {
    type: String,
    enum: ["active", "inactive"],
    default: "active",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const VendorProduct = mongoose.model("VendorProduct", VendorProductSchema);
module.exports = VendorProduct;
