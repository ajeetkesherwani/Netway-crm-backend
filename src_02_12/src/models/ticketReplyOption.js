const mongoose = require("mongoose");

const ticketReplyOptionSchema = new mongoose.Schema(
    {
        optionText: {
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

const TicketReplyOption = mongoose.model("TicketReplyOption", ticketReplyOptionSchema);

module.exports = TicketReplyOption;
