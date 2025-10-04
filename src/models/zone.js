const mongoose = require("mongoose");

const zoneSchema = new mongoose.Schema(
    {
        zoneName: {
            type: String,
            required: true,
            trim: true,
        },
        addedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Admin",
        },
    },
    { timestamps: true }
);

const Zone = mongoose.model("Zone", zoneSchema);

module.exports = Zone;
