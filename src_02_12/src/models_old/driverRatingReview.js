const mongoose = require("mongoose");

const driver_RatingReview = new mongoose.Schema({
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
        required: true,
    },
    review: {
        type: String,
        required: true
    }
},
    { timestamps: true }
);

const DriverRatingReview = mongoose.model("DriverRatingReview", driver_RatingReview);

module.exports = DriverRatingReview;
