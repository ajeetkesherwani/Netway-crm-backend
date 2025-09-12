const mongoose = require("mongoose");

const newsLetterSchema = new mongoose.Schema({ 
     vendor_Id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Vendor",
        required: true
     },
     product_Id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Products",
        required: true,
     },
     title: {
        type: String,
        trim: true,
        required: true
     },
     time_duration: {
        type: String,
        required: true
     },
     description: {
        type: String,
        trim: true,
        required: true
     }
}, { timestamps: true });

const NewsLetter = mongoose.model("NewsLetter", newsLetterSchema);

module.exports = NewsLetter;