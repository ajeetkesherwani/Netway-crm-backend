const mongoose = require("mongoose");
const { Schema } = mongoose;

const userWalletHistorySchema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            refPath: "userModel",
            required: true,
        },
        userModel: {
            type: String,
            enum: ["Admin", "Reseller", "Lco"],
            required: true,
            default: "Admin",
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
        relatedPurchasePlanId: {
            type: Schema.Types.ObjectId,
            ref: "PurchasedPlan",
        },
        remark: { type: String, default: "plan purched" }
    },
    { timestamps: true });


module.exports = mongoose.model("UserWalletHistory", userWalletHistorySchema);
