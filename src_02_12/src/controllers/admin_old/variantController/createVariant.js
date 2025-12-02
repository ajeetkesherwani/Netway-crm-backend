const VariantType = require("../../../models_old/variantType");

exports.createVariant = async (req, res) => {
  try {
    const { serviceId, variantName } = req.body;

    if (!serviceId)
      return res
        .status(400)
        .json({ success: false, message: "serviceId is required" });
    if (!variantName)
      return res
        .status(400)
        .json({ success: false, message: "variantName is required" });

    const newVariant = new VariantType({ serviceId, variantName });

    await newVariant.save();

    res.status(201).json({ success: true, data: newVariant });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
