const ProductVariant = require("../../../models_old/productVariant");
const AppError = require("../../../utils/AppError");

exports.getProductVarientByVarientId = async (req, res) => {
  const id = req.params.id;
  console.log(id);
  try {
    const getProductVariants = await ProductVariant.find({ variantTypeId: id });

    if (!getProductVariants) {
      return new AppError("productVariants not found", 404);
    }

    res.status(200).json({
      success: true,
      message: "productVariant found",
      data: getProductVariants,
    });
  } catch (error) {
    return new AppError(error.message, 500);
  }
};
