const mongoose = require("mongoose");

const cms_pageSchema = new mongoose.Schema({
    term_condition: {
        type: String,
        trim: true,
        required: true
    },
    privacy_policy: {
        type: String,
        trim: true,
        required: true
    },
    type:{
        type: String,
        enum: ["User", "Vendor", "Other"],
        default: "Other"
    },
    about_us: {
        type: String,
        trim: true,
        required: true
    }
});

const Cms_Page = mongoose.model("Cms_Page", cms_pageSchema);
module.exports = Cms_Page;