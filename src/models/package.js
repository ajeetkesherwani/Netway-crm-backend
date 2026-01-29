const mongoose = require("mongoose");
const { Schema } = mongoose;

const iptvPackageSchema = new Schema({
    plan_id: { type: Number },
    plan_code: { type: String},
    plan_name: { type: String},
    plan_type: { type: String },
    plan_cat: { type: String },
    plan_period: { type: String },
    customer_price: { type: String },
    lco_price: { type: String },
}, { _id: false });

//OTT sub-schema (same as you do for IPTV)
const ottPackageSubSchema = new Schema({
    packId: { type: String },
    name: { type: String,  },
    basePrice: { type: Number },
    marketPrice: { type: Number },
    validity: {
        number: { type: Number },
        unit: { type: String }
    },
    ottProviders: [{
        name: { type: String },
        validity: { type: Number }
    }]
}, { _id: false });

const packageSchema = new Schema({
    name: { type: String, required: true, trim: true }, // e.g. "Premium WiFi + OTT"
    validity: {
        number: { type: Number, required: true }, // Enter number
        unit: { type: String, enum: ["Day", "Week", "Month", "Year"], required: true } // Dropdown selection
    },
    basePrice: { type: Number },
    offerPrice: { type: Number },
    sacCode: { type: String },
    fromDate: { type: Date },
    toDate: { type: Date },
    status: { type: String, enum: ["active", "inActive"], required: true },
    typeOfPlan: { type: String, enum: ["Renew", "Speed Booster Plan", "Valume Booster"], default: "Renew" },
    categoryOfPlan: { type: String, enum: ["Unlimited", "Limited", "Fup", "DayNight"], required: true },
    description: { type: String },
    billType: { type: String, enum: ["Monthly", "Quarterly", "HalfYear", "Yearly", "OneTime"], default: "Monthly" },



    packageAvailable: { type: Boolean, default: false },
    offerPackage: { type: Boolean, default: false },

    // Bundle with OTT
    isOtt: { type: Boolean, default: false },
    ottType: { type: String, enum: ["playBox"], default: "playBox" },
    ottPackageId: {
        type: ottPackageSubSchema,
        default: null
    },

    // Bundle with IPTV
    isIptv: { type: Boolean, default: false },
    iptvType: { type: String, enum: ["ziggTv"], default: "ziggTv" },
    iptvPackageId: { type: iptvPackageSchema },

    // Timestamps
}, { timestamps: true });

// module.exports = mongoose.model("Package", packageSchema);
module.exports = mongoose.models.Package || mongoose.model("Package", packageSchema);

