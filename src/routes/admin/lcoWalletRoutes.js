const express = require("express");

const {
    adminAuthenticate
} = require("../../controllers/admin/auth/adminAuthenticate");

const {
    transferToLco
} = require("../../controllers/admin/lcoWalletController/createLcoWalletHistory");

const {
    getLcoWalletHistory
} = require("../../controllers/admin/lcoWalletController/getLcoWalletList");

const {
    getLcoWalletHistoryDetails
} = require("../../controllers/admin/lcoWalletController/getLcoWalletDetail");

const router = express.Router();

router.post("/create", adminAuthenticate, transferToLco);
router.get("/list/:lcoId", adminAuthenticate, getLcoWalletHistory);
router.get("/list/:lcoId/:walletId", adminAuthenticate, getLcoWalletHistoryDetails);

module.exports = router;
