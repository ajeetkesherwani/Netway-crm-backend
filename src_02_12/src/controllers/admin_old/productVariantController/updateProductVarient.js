const ProductVariant = require("../../../models_old/productVariant");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");

exports.updateProductVarient = catchAsync(async (req, res) => {
  let id = req.params.id;
  const { serviceId, variantTypeId, variants } = req.body;
  console.log(serviceId, variantTypeId, variants);

  if (!serviceId || !serviceId.trim())
    return new AppError(`serviceId is required,`, 400);
  if (!variantTypeId || !variantTypeId.trim())
    return new AppError(`variantTypeId is required,`, 400);
  if (!variants) return new AppError(`variants is required,`, 400);

  let prodVarient = await ProductVariant.findById(id);
  if (!prodVarient) {
    return new AppError("Product Varient not found", 404);
  }

  prodVarient.serviceId = serviceId || prodVarient.serviceId;
  prodVarient.variantTypeId = variantTypeId || prodVarient.variantTypeId;
  prodVarient.variants = variants || prodVarient.variants;

  await prodVarient.save();

  return res.status(200).json({
    status: true,
    message: "Product Varient updated successfully",
    data: { prodVarient },
  });
});
