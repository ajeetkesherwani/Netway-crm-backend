const mongoose = require("mongoose");

const driverAccountSchema = new mongoose.Schema({ 
    
    accountNumber: { type: String, required: true, trim: true },
    ifscCode: { type: String, required: true, trim: true },
    bankName: { type: String, required: true, trim: true },
    bankType: { type: String, enum: ["Saving", "Fixed Account", "Other"], default: "Saving" }

}, { timestamps: true });

const DriverAccountDetail = mongoose.model("DriverAccountDetail", driverAccountSchema);

module.exports = DriverAccountDetail;

