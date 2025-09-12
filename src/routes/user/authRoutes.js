const express = require("express");
const router = express.Router();

const sendOtp = require("../../controllers/user/authController/sendOtp");
const {
  verifyOtp,
} = require("../../controllers/user/authController/verifyOtp");

router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
module.exports = router;
