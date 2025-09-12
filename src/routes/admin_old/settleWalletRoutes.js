const express = require("express");

const { 
    adminAuthenticate 
} = require("../../controllers/admin/auth/adminAuthenticate");

const { 
    getVendorWalletList 
} = require("../../controllers/admin/paymentSettlementController/getAllvendorWallet");

const { 
    settleVendorWallets 
} = require("../../controllers/admin/paymentSettlementController/createSettlement");

const router = express.Router();

router.get("/list", adminAuthenticate, getVendorWalletList);
router.post("/create", adminAuthenticate, settleVendorWallets);

module.exports = router;