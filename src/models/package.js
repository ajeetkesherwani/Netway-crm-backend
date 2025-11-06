const mongoose = require("mongoose");
const { Schema } = mongoose;

const packageSchema = new Schema({
    name: { type: String, required: true, trim: true }, // e.g. "Premium WiFi + OTT"
    validity: {
        number: { type: Number, required: true }, // Enter number
        unit: { type: String, enum: ["Day", "Week", "Month", "Year"], required: true } // Dropdown selection
    },
    basePrice: { type: Number },
    offerPrice: { type: String },
    sacCode: { type: String },
    fromDate: { type: Date },
    toDate: { type: Date },
    status: { type: String, enum: ["active", "inActive"], required: true },
    typeOfPlan: { type: String, enum: ["Renew", "Speed Booster Plan", "Valume Booster"], default: "Renew" },
    categoryOfPlan: { type: String, enum: ["Unlimited", "Limited", "Fup", "DayNight"], required: true },
    description: { type: String },
    isIptv: { type: Boolean, default: false },
    iptvPlanName: { type: String },
    isOtt: { type: Boolean, default: false },
    ottPlanName: { type: String }


    // Timestamps
}, { timestamps: true });

module.exports = mongoose.model("Package", packageSchema);
