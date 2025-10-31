const express = require("express");
const router = express.Router();

const { signup } = require("../../controllers/admin/auth/signup");
const { login } = require("../../controllers/admin/auth/login");
const {
  sendOtpForResetPassword,
} = require("../../controllers/admin/auth/sendOtpForResetPassword");
const {
  resetPasswordWithOtp,
} = require("../../controllers/admin/auth/resetPasswordWithOtp");
const {
  adminAuthenticate,
} = require("../../controllers/admin/auth/adminAuthenticate");

const {
  vendorAccountVerification,
} = require("../../controllers/admin/auth/vendorAccountVerification");


//=============== CRM Auth ==========================//
router.post("/login", login);

//=============== CRM Auth ==========================//
router.post(
  "/vendorAccountVerification",
  adminAuthenticate,
  vendorAccountVerification
);
router.post("/signup", signup);
router.post("/forgotPassword", sendOtpForResetPassword);
router.post("/reset-password", resetPasswordWithOtp);
module.exports = router;
