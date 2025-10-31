const mongoose = require("mongoose");

const exchangeRequestSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor", required: true },
    subOrderId: { type: mongoose.Schema.Types.ObjectId, ref: "SubOrder", required: true },
    mainOrderId: { type: mongoose.Schema.Types.ObjectId, ref: "mainOrderId", required: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Products", required: true },
    originalVariantTypeId: {
        type: String
    },
    requestedVariantTypeId: {
        type: String,
        required: true
    },
    exchangeReason: {
        type: String,
        required: true
    },
    uploadFiles: {
        type: [String]
    },
    status: {
        type: String,
        enum: ["pending", "approved", "rejected", "pickup_initiated", "received", "exchanged_completed"],
        default: "pending"
    },
}, { timestamps: true });

const ExchangeRequest = mongoose.model("ExchangeRequest", exchangeRequestSchema);

module.exports = ExchangeRequest;