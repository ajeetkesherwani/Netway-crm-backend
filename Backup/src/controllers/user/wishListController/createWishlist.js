const Wishlist = require("../../../models/wishlist");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");

exports.createWishlist = catchAsync(async (req, res, next) => {
  const user_Id = req.user.id;
  const { product_Id } = req.body;
  // if (!user_Id) return next(new AppError("userId is required", 400));
  if (!product_Id) return next(new AppError("productId is required", 400));

  const existingWishlist = await Wishlist.findOne({ user_Id, product_Id });
  if (existingWishlist) {
    return res.status(200).json({
      status: true,
      message: "wishlist already exist",
      data: existingWishlist,
    });
  }

  const newWishlist = new Wishlist({ user_Id, product_Id });

  await newWishlist.save();

  res.status(200).json({
    status: true,
    message: "new wishlist added successfully",
    data: newWishlist,
  });
});

//String(Number(existingCart.quantity) + Number(quantity));
