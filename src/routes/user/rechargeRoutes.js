const express = require("express");
const {
  userAuthenticate,
} = require("../../controllers/user/authController/userAuthenticate");
const {
  planPurchase,
} = require("../../controllers/user/rechargeController/planPurchase");
const router = express.Router();

router.get("/planPurchase", userAuthenticate, planPurchase);

module.exports = router;
