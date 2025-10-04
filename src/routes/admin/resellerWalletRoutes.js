const express = require("express");

const {
    adminAuthenticate
} = require("../../controllers/admin/auth/adminAuthenticate");

const {
    createResellerWallet
} = require("../../controllers/admin/resellerWalletHistory/createWalletHistory");

const {
    getResellerWalletHistory
} = require("../../controllers/admin/resellerWalletHistory/getResellerWalletHistory");

const {
    getResellerWalletHistoryDetails
} = require("../../controllers/admin/resellerWalletHistory/getResellerWalletDetails");

const router = express.Router();

router.post("/create", adminAuthenticate, createResellerWallet);
router.get("/list/:resellerId", adminAuthenticate, getResellerWalletHistory);
router.get("/list/:resellerId/:walletId", adminAuthenticate, getResellerWalletHistoryDetails);

module.exports = router;
