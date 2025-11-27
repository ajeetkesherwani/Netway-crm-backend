const mongoose  = require("mongoose");

const cmsSchema = new mongoose.Schema({
    aboutUs: { type: String, required: true },
    terms_Conditions: { type: String, required: true },
    privacyPolicy: { type: String, required: true},
   
}, { timestamps: true });

const Cms = mongoose.model("Cms", cmsSchema);

module.exports = Cms;
