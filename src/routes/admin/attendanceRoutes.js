const express = require("express");

const { adminAuthenticate } = require("../../controllers/admin/auth/adminAuthenticate");
const { 
  checkIn, 
  checkOut, 
  getMonthlyReport, 
  upsertAttendance 
} = require("../../controllers/admin/attendance/attendance");

const router = express.Router();

// Both Staff and Admin routes are protected by adminAuthenticate 
// (which decodes the token and sets req.user.role)
router.use(adminAuthenticate);

// Staff Actions
router.post("/check-in", checkIn);
router.post("/check-out", checkOut);

// Admin Actions
router.get("/report", getMonthlyReport);
router.post("/upsert", upsertAttendance);

module.exports = router;
