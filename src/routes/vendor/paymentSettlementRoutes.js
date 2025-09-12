const express = require("express");

const { 
    vendorAuthenticate 
} = require("../../controllers/vendor/authController/vendorAuthenticate");

const { 
    getPaymentSettlement 
} = require("../../controllers/vendor/paymentSattlementController/getPaymentSettlement");

const router = express.Router();

router.get("/list", vendorAuthenticate, getPaymentSettlement );

module.exports = router;