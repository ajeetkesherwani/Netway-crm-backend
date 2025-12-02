const VariantType = require("../../../models_old/variantType");

exports.updateVariant = async (req, res) => {
  try {
    const variantId = req.params.id;
    if (!variantId)
      return res
        .status(400)
        .json({ success: false, message: "id is required" });

    const updatedVariants = await VariantType.findById(variantId);
    if (!updatedVariants)
      return res
        .status(400)
        .json({ success: false, message: "variants not found" });

    const { variantName, serviceId } = req.body;
    if (!variantName) {
      return res
        .status(400)
        .json({ success: false, message: "variantName is required" });
    }

    updatedVariants.variantName = variantName || updatedVariants.variantName;
    updatedVariants.serviceId = serviceId || updatedVariants.serviceId;
    // updatedVariants.category = category || updatedVariants.category;

    await updatedVariants.save();

    res.status(200).json({
      success: true,
      message: "variant updated successfully",
      data: updatedVariants,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
