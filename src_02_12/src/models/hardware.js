const mongoose = require("mongoose");

const hardwareSchema = new mongoose.Schema({
    hardwareName: { type: String, required: true },
    hardwareType: { type: String, enum: ["router", "cable", "switch"], default: "router" },
    brand: { type: String },
    model: { type: String },
    serialNumber: { type: String },
    ipAddress: { type: String },
    macAddress: { type: String },
    portCount: { type: String },
    cableLength: { type: String },
    location: { type: String },
    status: { type: String, default: "active" },
    assignedTo: { type: String },
    purchaseDate: { type: Date },
    warrantyExpiry: { type: Date },
    price: { type: Number },
    notes: { type: String },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
}, { timestamps: true });

const Hardware = mongoose.model("Hardware", hardwareSchema);
module.exports = Hardware;