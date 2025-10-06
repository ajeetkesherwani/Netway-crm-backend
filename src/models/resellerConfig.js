const mongoose = require("mongoose");

const resellerConfigSchema = new mongoose.Schema(
    {
        type: { type: String, enum: ["Admin", "Manager", "Operator"], default: "Admin" },
        typeId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Retailer"
        },
        admin: [],
        manager: [],
        operator: [],
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
