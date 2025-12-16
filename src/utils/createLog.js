const Logs = require("../models/activity");

const createLog = async ({ createdById, createdByRole, action, description = "" }) => {
  try {
    await Logs.create({
      createdById,
      createdByRole,
      action,
      description
    });
  } catch (error) {
    console.error("Log creation failed:", error.message);
  }
};

module.exports = createLog;
