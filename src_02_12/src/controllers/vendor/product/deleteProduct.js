const fs = require("fs");
const path = require("path");
const ProductModel = require("../../../models/products");

const deleteProduct = async (req, res) => {
    try {
        const product = await ProductModel.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        // Delete primary image
        if (product.primary_image) {
            const primaryPath = path.normalize(product.primary_image); // normalize slashes
            if (fs.existsSync(primaryPath)) {
                fs.unlinkSync(primaryPath);
            }
        }

        // Delete gallery images
        if (Array.isArray(product.gallery_image)) {
            for (const img of product.gallery_image) {
                const imgPath = path.normalize(img);
                if (fs.existsSync(imgPath)) {
                    fs.unlinkSync(imgPath);
                }
            }
        }

        // Delete product from DB
        await ProductModel.findByIdAndDelete(req.params.id);

        res.json({ success: true, message: 'Product and images deleted successfully' });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = deleteProduct;
