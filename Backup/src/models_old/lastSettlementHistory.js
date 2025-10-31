const mongoose = require("mongoose");

const lastSettlementHistorySchema = new mongoose.Schema({

    vendorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Vendor",
        required: true
    },
    lastSettlementAmount: {
        type: Number,
        default:""
    },
    lastSettlementDate: {
        type: Date,
        default:""
    },
    file: {
        type: String, 
        default: ""
    }
}, { timestamps: true });

const LastSettlementHistory = new mongoose.model("LastSettlementHistory", lastSettlementHistorySchema );

module.exports = LastSettlementHistory;