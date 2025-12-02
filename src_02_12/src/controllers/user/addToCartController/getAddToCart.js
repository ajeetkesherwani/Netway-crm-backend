const AddToCart = require("../../../models/addToCart");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");

exports.getAddTOCart = catchAsync(async (req, res, next) => {
  const user_Id = req.user.id;
  if (!user_Id) return next(new AppError("id is required", 400));

  const getCart = await AddToCart.find({ user_Id })
    .populate("product_Id", "name primary_image")
    .populate("vendorId", "shopName")
    .populate("variants.variantTypeId")
    .sort({ createdAt: -1 })
    .lean();

  if (!getCart) return next(new AppError("Cart not found", 404));

  res.status(200).json({
    status: true,
    message: "Cart found",
    count: getCart.length,
    data: getCart,
  });
});
