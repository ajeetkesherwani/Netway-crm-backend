const mongoose = require("mongoose");

const order_RatingReview = new mongoose.Schema({
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

const OrderRatingReview = mongoose.model("OrderRatingReview", order_RatingReview);

module.exports = OrderRatingReview;
