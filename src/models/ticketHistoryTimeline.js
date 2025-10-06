const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
    activityType: { type: Number, enum: [0, 1, 2], required: true }, // 0 = assign, 1 = status change, 2 = reassign
    performedBy: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
});

const ticketHistorySchema = new mongoose.Schema({
    ticketId: { type: String, required: true, unique: true },
    activities: [activitySchema]
});

const TicketHistoryTimeline = mongoose.model('TicketHistoryTimeline', ticketHistorySchema);
module.exports = TicketHistoryTimeline;
