const mongoose = require("mongoose");

const ticketCategorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
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

const TicketCategory = mongoose.model("TicketCategory", ticketCategorySchema);

module.exports = TicketCategory;
