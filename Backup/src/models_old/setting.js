const mongoose = require("mongoose");

const settingSchema = mongoose.Schema({

    brandName: { type: String, default: "" },
    logo: { type: String, default: "" },
    commission: { type: String, default: "" },
    gst: { type: String, default: "" },
    onboardingFee: { type: String, default: "" },
    plateformFee: { type: String, default: "" },
    finalPlateformFee: { type: String, default: "" },
    email: { type: String, default: "" },
    mobile: { type: String, default: "" },
    address: { type: String, default: "" },
    driver_commission:  {type: Number, default: 0},
    vendor_commission: { type: Number, default: 0 }
});

const Setting = mongoose.model("Setting", settingSchema);
module.exports = Setting;