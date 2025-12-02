const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const ProductModel = require("../../../models/products");

const updateProduct = async (req, res) => {
    try {
        const productId = req.params.id;
        const existingProduct = await ProductModel.findById(productId);
        if (!existingProduct) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        const {
            name,
            category,
            fabric,
            price,
            discountedPrice,
            returnAvailable,
            exchangeAvailable,
            vendor
        } = req.body;

        // Parse variants if present
        let variants;
        if (req.body.variants) {
            try {
                variants = JSON.parse(req.body.variants);
            } catch (err) {
                return res.status(400).json({ success: false, message: "Invalid JSON in variants field" });
            }
        }

        // Image updates
        if (req.files.primary_image) {
            if (existingProduct.primary_image && fs.existsSync(existingProduct.primary_image)) {
                fs.unlinkSync(existingProduct.primary_image);
            }
            existingProduct.primary_image = req.files.primary_image[0].path;
        }

        if (req.files.gallery_image) {
            for (const img of existingProduct.gallery_image) {
                if (fs.existsSync(img)) fs.unlinkSync(img);
            }
            existingProduct.gallery_image = req.files.gallery_image.map(file => file.path);
        }

        // Update fields if present
        if (name) existingProduct.name = name;
        if (category && mongoose.Types.ObjectId.isValid(category)) existingProduct.category = category;
        if (fabric && mongoose.Types.ObjectId.isValid(fabric)) existingProduct.fabric = fabric;
        if (price != null) existingProduct.price = price;
        if (discountedPrice != null) existingProduct.discountedPrice = discountedPrice;
        if (returnAvailable != null) existingProduct.returnAvailable = returnAvailable === "true";
        if (exchangeAvailable != null) existingProduct.exchangeAvailable = exchangeAvailable === "true";
        if (vendor && mongoose.Types.ObjectId.isValid(vendor)) existingProduct.vendor = vendor;
        if (variants) existingProduct.variants = variants;

        await existingProduct.save();
        return res.status(200).json({ success: true, message: "Product updated successfully", product: existingProduct });

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = updateProduct;
