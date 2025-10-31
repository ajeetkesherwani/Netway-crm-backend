const ProductVariant = require("../../../models_old/productVariant");
const paginate = require("../../../utils/paginate");

exports.getAllProductVariant = async (req, res) => {
  const { variantTypeId } = req.query; // get from query parameters

  try {
    // Build query conditionally
    const query = {};
    if (variantTypeId) {
      query.variantTypeId = variantTypeId;
    }

    const{ page, limit } = req.query;

    const getProductVariants = await paginate(ProductVariant, query,{
      page,
      limit,
      sort:{createdAt: -1},
      populate: { path: "serviceId", select: "name status image" },
      populate: { path: "variantTypeId", select: "variantName" }
    });


    if (!getProductVariants || getProductVariants.paginateData.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "productVariants not found" });
    }

    res.status(200).json({
      success: true,
      message: "productVariant found",
      count: getProductVariants.paginateData.length,
      data: getProductVariants,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
