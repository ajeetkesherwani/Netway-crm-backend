const VendorRatingReview = require("../../../models/vendorRatingReview");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");

exports.createVendorRatingReview = catchAsync(async (req, res,next) => {

  const { user_id, ratingBy, rating, review } = req.body;

        if(!user_id || !ratingBy || !rating || !review){
            return next(new AppError("All fields are required", 400));
        } 

         const newVendorRatingReview = new VendorRatingReview({ user_id, ratingBy, rating, review });

        // await newVendorRatingReview.save();
   
        res.status(200).json({ success: true, message: "vendorRatingReview  created successfully", data: newVendorRatingReview})

});