const mongoose = require("mongoose");

const driverSchema = new mongoose.Schema({

    firstName: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        trim: true
    },
    dob: {
        type: Date,
        required: true
    },
    gender: {
        type: String,
        enum: ["male", "female", "other"],
        required: true
    },
    email: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    mobile: {
        type: Number,
        unique: true,
        required: true
    },
    vehicleType: {
        type: String,
        enum: ["Bike", "Bicycle ", "Car", "Auto"]
    },
    otp: {
        type: String,
        default: ""
    },
    otpExpire: {
        type: Date,
        default: null
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    isBlocked: {
        type: Boolean,
        default: false
    },
    commission: {
        type: Number,
        default: 0,
    },
    walletBalance: {
        type: Number,
        default: 0
    },
    location: {
        latitude: {
            type: String,
            default: ""
        },
        longitude: {
            type: String,
            default: ""
        }
    },
    frontPhoto: {
        type: String,
        required: true,
        trim: true
    },

    status: {
        type: Boolean,
        default: false
    },
    details: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "DriverDetail",
    },
    accounts: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "DriverAccountDetail",
    }

}, { timestamps: true });

const Driver = mongoose.model("Driver", driverSchema);

module.exports = Driver;