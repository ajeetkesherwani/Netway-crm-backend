const DriverRatingReview = require("../../../models/driverRatingReview");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");

exports.createdriverRatingReview = catchAsync(async (req, res, next) => {


    const { user_id, ratingBy, rating, review } = req.body;

    if (!user_id || !ratingBy || !rating || !review) {
        return next(new AppError("All filds are required", 400));
    }

    const newDriverRatingReview = new DriverRatingReview({ user_id, ratingBy, rating, review });

    // await newDriverRatingReview.save();

    res.status(200).json({ success: true, message: "driverRatingReview  created successfully", data: newDriverRatingReview });

});