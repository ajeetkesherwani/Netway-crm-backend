const express = require("express");

const { 
    getAllExchangeRequest 
} = require("../../controllers/vendor/exchangeRequestController/getAllexchangeRequest");

const { 
    vendorAuthenticate 
} = require("../../controllers/vendor/authController/vendorAuthenticate");

const { 
    updateExchangeRequestStatus 
} = require("../../controllers/vendor/exchangeRequestController/updateExchangeRequest");

const router = express.Router();

router.get("/list", vendorAuthenticate, getAllExchangeRequest);
router.patch("/list/:id", vendorAuthenticate, updateExchangeRequestStatus);

module.exports = router;