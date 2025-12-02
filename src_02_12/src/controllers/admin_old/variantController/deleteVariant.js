const VariantType = require("../../../models_old/variantType");

exports.deleteVariant = async (req, res) => {
    try {

        const variantId = req.params.id;
        if (!variantId) return res.status(40).json({ success: false, message: "id is required" });

        const deletedVariants = await VariantType.findOne({ _id: variantId });
        if (!deletedVariants) {
            return res.status(400).json({ success: false, message: "variantType not found" });
        }

        await VariantType.findByIdAndDelete(variantId);
        return res.status(200).json({ success: true, message: "variantType deleted successfully", data: deletedVariants });

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message })
    }
}