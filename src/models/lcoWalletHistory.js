const mongoose = require("mongoose");

const lcoWalletHistorySchema = new mongoose.Schema({
    lco: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Lco",
        required: true
    },
    reseller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Retailer",
    },
    amount: {
        type: Number,
        required: true,
        min: 1
    },
    transferDate: {
        type: Date,
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

const LcoWalletHistory = mongoose.model("LcoWalletHistory", lcoWalletHistorySchema);

module.exports = LcoWalletHistory;