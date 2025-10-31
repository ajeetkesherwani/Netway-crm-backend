const express = require("express");
const router = express.Router();
const {
  vendorAuthenticate,
} = require("../../controllers/vendor/authController/vendorAuthenticate");
const {
  getProfile,
} = require("../../controllers/vendor/profileController/getProfile");

console.log("Route Loaded");
router.get("/get", vendorAuthenticate, getProfile);

module.exports = router;
