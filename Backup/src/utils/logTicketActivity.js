const TicketHistoryTimeline = require("../models/ticketHistoryTimeline");

const logTicketActivity = async ({ ticketId, activityType, assignTo, performedBy }) => {
    const activity = { activityType, assignTo, performedBy };

    const timeline = await TicketHistoryTimeline.findOne({ ticketId });
    if (timeline) {
        timeline.activities.push(activity);
        await timeline.save();
    } else {
        await TicketHistoryTimeline.create({
            ticketId,
            activities: [activity]
        });
    }
};

module.exports = logTicketActivity;
