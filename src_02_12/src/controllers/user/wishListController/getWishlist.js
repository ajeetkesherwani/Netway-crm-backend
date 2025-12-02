const Wishlist = require("../../../models/wishlist");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");

exports.getWishlist = catchAsync(async (req, res, next) => {
  const user_Id = req.user.id;
  if (!user_Id) {
    return next(new AppError("id is required", 400));
  }

  const getList = await Wishlist.find({ user_Id }).populate(
    "product_Id",
    "name primary_image price discountedPrice"
  );
  if (!getList) return next(new AppError("Wishlist not found", 404));

  const data = {
    count: getList.length,
    list: getList,
  };
  //   successResponse(res, 200, "Wishlist found", data);
  res.status(200).json({
    status: true,
    message: "Wishlist found",
    count: getList.length,
    data: getList,
  });
});
