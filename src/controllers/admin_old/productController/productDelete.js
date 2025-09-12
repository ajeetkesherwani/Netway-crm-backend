const Product = require("../../../models_old/products");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");

exports.productDelete = catchAsync(async (req, res) => {
  let id = req.params.id;
  console.log(id);
  if (!id || !id.trim()) {
    return new AppError(`Id is required.`, 400);
  }

  const deletedproduct = await Product.findById(id);
  if (!deletedproduct) return new AppError(`Product not found.`, 400);

  await Product.findByIdAndDelete(id);
  message = "Product Deleted successfully";

  return res.status(200).json({
    status: true,
    message: message,
  });
});
