const mongoose = require("mongoose");

const driverDetailSchema = new mongoose.Schema({

    rcRegistration: {
        frontPhoto: { type: String, required: true, trim: true },
        backPhoto: { type: String, required: true, trim: true }
    },
    licence: {
        number: { type: String, required: true, trim: true },
        frontPhoto: { type: String, required: true, trim: true },
        backPhoto: { type: String, required: true, trim: true }
    },
    adharCard: {
        frontPhoto: { type: String, required: true, trim: true },
        backPhoto: { type: String, required: true, trim: true }
    },
    
}, { timestamps: true });

const DriverDetail = mongoose.model("DriverDetail", driverDetailSchema);

module.exports = DriverDetail;