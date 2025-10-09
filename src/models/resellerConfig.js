const mongoose = require("mongoose");

const resellerConfigSchema = new mongoose.Schema(
    {
        type: { type: String, enum: ["Admin", "Reseller", "Lco"], default: "Reseller" },
        typeId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            refPath: "type"
        },
        admin: {
            type: Map,
            of: new mongoose.Schema({}, { strict: false, _id: false }) // Dynamic module-based permissions
        },

        manager: {
            type: Map,
            of: new mongoose.Schema({}, { strict: false, _id: false }) // Dynamic module-based permissions
        },

        operator: {
            type: Map,
            of: new mongoose.Schema({}, { strict: false, _id: false }) // Dynamic module-based permissions
        },
        createdBy: {
            type: String
        },
        createdById: {
            type: mongoose.Schema.Types.ObjectId,
            refPath: "createdBy"
        }
    },
    { timestamps: true }
);

const ResellerConfig = mongoose.model("ResellerConfig", resellerConfigSchema);

module.exports = ResellerConfig;
