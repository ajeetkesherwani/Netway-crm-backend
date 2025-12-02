const OrderRatingReview = require("../../../models/orderRatingReview");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");

exports.createOrderRatingReview = catchAsync(async (req, res, next) => {
  const { ratingBy, rating, review } = req.body;
  const user_id = req.user.id;
  if (!user_id || !ratingBy || !rating || !review) {
    return next(new AppError("All fields are required", 400));
  }

  const newOrderRatingReview = new OrderRatingReview({
    user_id,
    ratingBy,
    rating,
    review,
  });

  // await newOrderRatingReview.save();

  res.status(200).json({
    success: true,
    message: "orderRatingReview  created successfully",
    data: newOrderRatingReview,
  });
});
