const mongoose = require("mongoose");
const { Schema } = mongoose;

const packageSchema = new Schema({
    name: { type: String, required: true, trim: true }, // e.g. "Premium WiFi + OTT"
    description: { type: String, trim: true },
    
    // Plan Type
    type: { 
        type: String, 
        enum: ["OTT", "WiFi", "Combo"], 
        required: true 
    },

    // Pricing & Validity
    price: { type: Number, required: true },
    validityInDays: { type: Number, required: true }, // e.g. 30, 90, 365
    trialPeriodInDays: { type: Number, default: 0 },
    billingType: { type: String,  default: "One Time" },
    packageInfo: { type: String },
    sortOrder: { type: Number, default: 0 },
    speed: { type: String },
    isPackageForNewAccounts: { type: Boolean, default: false },
    isPackageIsOffer: { type: Boolean, default: false },
    isBundleWithOtt: { type: Boolean, default: false },
    bunddleOttType: { type: String ,default: null},
    bunddleOttPackageName: { type: String ,default: null},
    isIncludeBundleAmountWithPackage: { type: Boolean, default: false},

    // General flags
    isActive: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },

    // Admin Reference
    addedBy: {
        type: Schema.Types.ObjectId,
        ref: 'Admin',
        required: true
    },

    // Timestamps
}, { timestamps: true });

module.exports = mongoose.model("Package", packageSchema);
