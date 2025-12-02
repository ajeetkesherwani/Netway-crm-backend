const mongoose = require("mongoose");

const ticketResolutionSchema = new mongoose.Schema(
    {
        name: {
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

const TicketResolution = mongoose.model("TicketResolution", ticketResolutionSchema);

module.exports = TicketResolution;
