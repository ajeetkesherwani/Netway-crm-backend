const mongoose = require("mongoose");

const settingSchema = new mongoose.Schema({
 playBoxToken: { type: String, default: "" },
}, { timestamps: true });

const Setting = mongoose.model("Setting", settingSchema);

module.exports = Setting;