const mongoose = require("mongoose");

const ticketCategorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        }
    },
    { timestamps: true }
);

const TicketCategory = mongoose.model("TicketCategory", ticketCategorySchema);

module.exports = TicketCategory;
