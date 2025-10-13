const express = require("express");

const {
    adminAuthenticate
} = require("../../controllers/admin/auth/adminAuthenticate");

const {
    lcoBalanceTransfer
} = require("../../controllers/admin/reports/franchisee/lcoBalanceTransfer");

const {
    lcoTransactionHistory
} = require("../../controllers/admin/reports/franchisee/lcoTransactionHistory");
const {
    onlineTransaction
} = require("../../controllers/admin/reports/franchisee/onlineTransaction");
const {
    resellerTransferBalance
} = require("../../controllers/admin/reports/franchisee/resellerTransferBalance");

const router = express.Router();

router.get("/lcoBalanceTransfer", adminAuthenticate, lcoBalanceTransfer);
router.get("/lcoTransactionHistory", adminAuthenticate, lcoTransactionHistory);
router.get("/onlineTransaction", adminAuthenticate, onlineTransaction);
router.get("/resellerTransferBalance", adminAuthenticate, resellerTransferBalance);

module.exports = router;