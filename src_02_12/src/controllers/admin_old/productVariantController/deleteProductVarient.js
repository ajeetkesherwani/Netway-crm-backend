const ProductVariant = require("../../../models_old/productVariant");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");

exports.deleteProductVarient = catchAsync(async (req, res) => {
  let id = req.params.id;
  console.log(id);
  if (!id || !id.trim()) {
    return new AppError(`Id is required.`, 400);
  }

  const deletedproVarient = await ProductVariant.findById(id);
  if (!deletedproVarient)
    return new AppError(`Product Varient not found.`, 400);

  await ProductVariant.findByIdAndDelete(id);
  message = "Product Varient Deleted successfully";

  return res.status(200).json({
    status: true,
    message: message,
  });
});
