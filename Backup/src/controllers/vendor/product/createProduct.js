const mongoose = require("mongoose");
const ProductModel = require("../../../models/products");

const createProduct = async (req, res) => {
  try {
    const {
      name,
      serviceId,
      fabricId,
      categoryId,
      subCategoryId,
      price,
      discountedPrice,
      returnAvailable,
      exchangeAvailable,
      vendor,
    } = req.body;

    // Parse variants (comes as string in multipart/form-data)
    let variants = [];
    if (req.body.variants) {
      try {
        variants = JSON.parse(req.body.variants);
      } catch (err) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid JSON in variants field" });
      }
    }

    // Validation
    if (!name || typeof name !== "string") {
      return res
        .status(400)
        .json({ success: false, message: "Product name is required" });
    }
    if (!mongoose.Types.ObjectId.isValid(category)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid category ID" });
    }
    if (!mongoose.Types.ObjectId.isValid(fabric)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid fabric ID" });
    }
    if (!req.files.primary_image || req.files.primary_image.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Primary image is required" });
    }
    if (!req.files.gallery_image || req.files.gallery_image.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one gallery image is required",
      });
    }
    if (!Array.isArray(variants) || variants.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "At least one variant is required" });
    }

    for (const [index, variant] of variants.entries()) {
      if (!variant.color || typeof variant.color !== "string") {
        return res.status(400).json({
          success: false,
          message: `Variant ${index + 1}: color is required`,
        });
      }
      if (!variant.size || typeof variant.size !== "string") {
        return res.status(400).json({
          success: false,
          message: `Variant ${index + 1}: size is required`,
        });
      }
      if (variant.quantity == null || typeof variant.quantity !== "number") {
        return res.status(400).json({
          success: false,
          message: `Variant ${index + 1}: quantity is required`,
        });
      }
    }

    if (price == null || typeof Number(price) !== "number") {
      return res
        .status(400)
        .json({ success: false, message: "Product price is required" });
    }

    if (!mongoose.Types.ObjectId.isValid(vendor)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid vendor ID" });
    }

    const primaryImage = req.files.primary_image[0].path;
    const galleryImages = req.files.gallery_image.map((file) => file.path);

    const product = new ProductModel({
      name,
      category,
      fabric,
      primary_image: primaryImage,
      gallery_image: galleryImages,
      variants,
      price,
      discountedPrice,
      returnAvailable: returnAvailable === "true",
      exchangeAvailable: exchangeAvailable === "true",
      vendor,
    });

    await product.save();

    return res.status(201).json({ success: true, product });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = createProduct;
