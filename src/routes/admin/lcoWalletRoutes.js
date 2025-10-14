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
const { reverseLcoWalletTransfer } = require("../../controllers/admin/lcoWalletController/createRevrsBalanceforLco");

const router = express.Router();

router.post("/create", adminAuthenticate, transferToLco);
router.post("/reverse-balance", adminAuthenticate, reverseLcoWalletTransfer);
router.get("/list/:lcoId", adminAuthenticate, getLcoWalletHistory);
router.get("/list/:lcoId/:walletId", adminAuthenticate, getLcoWalletHistoryDetails);

module.exports = router;
