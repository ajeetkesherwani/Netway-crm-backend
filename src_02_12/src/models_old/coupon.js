const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    discountType: {
        type: String,
        enum: ["percentage", "fixed"],
        required: true
    },
    discountValue: {
        type: Number,
        required: true
    },
    minOrderAmount: {
        type: Number,
        default: 0
    },
    vendorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Vendor",
        default: null // 0 means apply to all
    },
    parUserLimit: {
        type: Number,
        default: 1 
    },
    usedCount: {
        type: Number,
        default: 0 
    },
    startDate: {
        type: Date,
        required: true
    },
    expiryDate: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ["active", "inactive"],
        default: "active",
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const Coupon = mongoose.model("Coupon", couponSchema)
module.exports = Coupon;
