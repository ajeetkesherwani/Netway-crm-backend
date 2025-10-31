const express = require("express");

const { 
    adminAuthenticate 
} = require("../../controllers/admin/auth/adminAuthenticate");

const { 
    getAllVendorWalletList 
} = require("../../controllers/admin/walletController/getAllVendorWalletList");

const { 
    getAllDriverWalletList 
} = require("../../controllers/admin/walletController/getDriverWalletList");

const router = express.Router();

router.get("/vendor/list", adminAuthenticate, getAllVendorWalletList);
router.get("/driver/list", adminAuthenticate, getAllDriverWalletList);

module.exports = router;