const express = require("express");
const {
  userAuthenticate,
} = require("../../controllers/user/authController/userAuthenticate");
const {
  getData,
} = require("../../controllers/user/checkoutController/getData");
const router = express.Router();

router.get("/getData", userAuthenticate, getData);
module.exports = router;
