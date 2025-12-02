const mongoose = require("mongoose");

const wishlistSchema = new mongoose.Schema({
    user_Id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    product_Id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Products",
        required: true
    },   
},{ timestamps: true });

const Wishlist = mongoose.model("Wishlist", wishlistSchema);
module.exports = Wishlist;