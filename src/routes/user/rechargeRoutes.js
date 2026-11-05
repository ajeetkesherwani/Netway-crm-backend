const express = require("express");
const {
  userAuthenticate,
} = require("../../controllers/user/authController/userAuthenticate");
const {
  planPurchase,
} = require("../../controllers/user/rechargeController/planPurchase");
const {
  createPlanPayment,
  handleCCAvenueCallback,
  getPlanPaymentStatus,
} = require("../../controllers/user/rechargeController/ccavenuePlanPayment");
const router = express.Router();

router.post("/plan-payment", userAuthenticate, createPlanPayment);
router.post("/ccavenue/callback", handleCCAvenueCallback);
router.get("/plan-payment/:orderId", userAuthenticate, getPlanPaymentStatus);

router.post("/planPurchase", userAuthenticate, planPurchase);

module.exports = router;
