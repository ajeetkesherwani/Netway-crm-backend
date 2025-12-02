const mongoose = require("mongoose");

const vendor_RatingReview = mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    ratingBy: {
         type: String,
        enum: ["User", "Vender", "Admin", "Other"],
        default: "Other",
        required: true
    }, 
    rating: {
        type: Number,
        min: 1,
        max: 5,
        required: true
    },
    review: {
        type: String,
        required: true
    }
},
{ timestamps: true }
);

const VendorRatingReview = mongoose.model("VendorRatingReview", vendor_RatingReview);

module.exports = VendorRatingReview;