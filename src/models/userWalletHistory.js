const mongoose = require("mongoose");
const { Schema } = mongoose;

const userWalletHistorySchema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        transactionType: {
            type: String,
            enum: ["debit", "credit"],
            required: true,
            default: "debit",
        },
        openingBalance: {
            type: Number,
            required: true,
            default: 0,
        },
        transferAmount: {
            type: Number,
            required: true,
            default: 0,
        },
        closingBalance: {
            type: Number,
            required: true,
            default: 0,
        },
        purpose: {
            type: String,
            default: ""
        },
        paymentMode: {
            type: String,
            enum: ["cash", "cheque", "onlineTrancation", "Online"],
            default: "Online",
        },
        paymentDate: {
            type: Date,
            default: Date.now
        },
        referenceNumber: {
            type: String,
            default: null,
        },
        relatedPurchasePlanId: {
            type: Schema.Types.ObjectId,
            ref: "PurchasedPlan",
            default: null
        },
        remark: { type: String, default: "plan purched" }
    },
    { timestamps: true });


module.exports = mongoose.model("UserWalletHistory", userWalletHistorySchema);
