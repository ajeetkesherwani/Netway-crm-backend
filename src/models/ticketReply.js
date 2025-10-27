const mongoose = require("mongoose");

const ticketReplySchema = new mongoose.Schema({
    ticket: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Ticket"
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    description: {
        type: String,
        required: true,
    },
    createdBy: {
        type: String
    },
    createdById: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: "createdBy"
    }

}, { timestamps: true });

const TicketReply = mongoose.model("TicketReply", ticketReplySchema);
module.exports = TicketReply;