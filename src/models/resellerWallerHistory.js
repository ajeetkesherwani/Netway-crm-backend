const mongoose = require("mongoose");

const resellerWalletHistorySchema = new mongoose.Schema({
    reseller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Retailer",
        required: true
    },
    amount: {
        type: Number,
        required: true,
        min: 1
    },
    paymentDate: {
        type: Date,
        required: true
    },
    mode: {
        type: String,
        enum: ["Cash", "Online", "Cheque", "Credit", "DD", "Reverse"],
        required: true
    },
    remark: {
        type: String,
        default: ""
    },
    createdBy: {
        type: String,
        required: true
    },
    createdById: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: "createdBy"
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

const ResellerWalletHistory = mongoose.model("ResellerWalletHistory", resellerWalletHistorySchema);

module.exports = ResellerWalletHistory;