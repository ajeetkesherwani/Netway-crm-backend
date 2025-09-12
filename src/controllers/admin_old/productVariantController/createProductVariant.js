const ProductVariant = require("../../../models_old/productVariant");

exports.createProductVariants = async(req, res) => {
    try {

        const { serviceId, variantTypeId, variants } = req.body;

        if (!serviceId) return res.status(500).json({ success: false, message: "serviceId is required" });
        if (!variantTypeId) return res.status(500).json({ success: false, message: "variantTypeId is required" });
        if (!variants) return res.status(500).json({ success: false, message: "variants is required" });

        const newProductVariant = new ProductVariant({ serviceId, variantTypeId, variants });
        await newProductVariant.save();

        return res.status(200).json({ success: true, message: "New ProductVariant saved", data: newProductVariant });

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}