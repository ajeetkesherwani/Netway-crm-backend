const VariantType = require("../../../models_old/variantType");

exports.getDataById = async (req, res) => {
  try {
    const variantId = req.params.id;
    console.log(variantId);
    if (!variantId)
      return res
        .status(400)
        .json({ success: false, message: "id is required" });

    const varaintsDeatials = await VariantType.findOne({ _id: variantId });
    if (!varaintsDeatials) {
      return res
        .status(400)
        .json({ success: false, message: "varintType not found" });
    }

    return res.status(200).json({
      success: true,
      message: "variantType details",
      data: varaintsDeatials,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
