const express = require("express");
const { adminAuthenticate } = require("../../controllers/admin/auth/adminAuthenticate");
const {
  getMonitoringLogs,
} = require("../../controllers/admin/monitoring/getMonitoringLogs");

const router = express.Router();

router.get("/logs", adminAuthenticate, getMonitoringLogs);

module.exports = router;
