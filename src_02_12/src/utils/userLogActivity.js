const ActivityLog = require("../models/activityLog");

exports.createLog = async ({ userId, type, description, details, addedBy, ip }) => {
  try {
    await ActivityLog.create({
      userId,
      type,
      description,
      details,
      ip,
      addedBy
    });
  } catch (err) {
    console.log("Activity Log Error:", err.message);
  }
};
