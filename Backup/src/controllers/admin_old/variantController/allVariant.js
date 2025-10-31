const VariantType = require("../../../models_old/variantType");
const paginate = require("../../../utils/paginate");

exports.allVariant = async (req, res) => {
  try {

    const { page, limit } = req.query;

    const variants = await paginate(VariantType, {}, {
      page,
      limit,
      sort: {createdAt: -1},
      populate: { path: "serviceId", select: "name" }
    });

    if (!variants || variants.paginateData.length === 0)
      return res
        .status(400)
        .json({ success: false, message: "varintType not found" });

    res.status(200).json({
      success: true,
      message: "variantType found",
      count: variants.paginateData.length,
      data: variants,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
