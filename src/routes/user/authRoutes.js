const express = require("express");
const router = express.Router();

const sendOtp = require("../../controllers/user/authController/sendOtp");
const {
  verifyOtp,
} = require("../../controllers/user/authController/verifyOtp");
const { mobileLogin } = require("../../controllers/user/authController/mobileLogin");


router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
router.post("/mobile-login", mobileLogin);
module.exports = router;
