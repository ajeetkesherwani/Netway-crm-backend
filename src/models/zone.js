const mongoose = require("mongoose");

const zoneSchema = new mongoose.Schema(
    {
        zoneName: {
            type: String,
            required: true,
            trim: true
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

const Zone = mongoose.model("Zone", zoneSchema);

module.exports = Zone;
