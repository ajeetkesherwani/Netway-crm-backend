const express = require("express");

const { 
    vendorAuthenticate 
} = require("../../controllers/vendor/authController/vendorAuthenticate");

const { 
    createLastSettlementHistory 
} = require("../../controllers/vendor/lastSettlementHistoryController/createLastSettlementHistory");

const fileUploader = require("../../middlewares/fileUploader");

const router = express.Router();

router.post("/create", 
    vendorAuthenticate,
    fileUploader("lastSettlementHistory", [
    { name: "file", maxCount: 1 }
  ]), 
    createLastSettlementHistory);

module.exports = router;
