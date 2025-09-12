const express = require("express");

const { 
    returnRequestOrder 
} = require("../../controllers/vendor/returnController/returnRequestOrder");

const { 
    returnReceivedOrder 
} = require("../../controllers/vendor/returnController/returnReceived");
const { vendorAuthenticate } = require("../../controllers/vendor/authController/vendorAuthenticate");

const router = express.Router();

router.get("/return-requests", vendorAuthenticate, returnRequestOrder);
router.patch("/return-received/:subOrderId", vendorAuthenticate, returnReceivedOrder);

module.exports = router;