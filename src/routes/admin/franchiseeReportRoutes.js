const express = require("express");

const {
    adminAuthenticate
} = require("../../controllers/admin/auth/adminAuthenticate");

// const {
//     lcoBalanceTransfer
// } = require("../../controllers/admin/reports/franchisee/lcoBalanceTransfer");

const {
    lcoBalanceTransfer
} = require("../../controllers/admin/reports/Franchisee/lcoBalanceTransfer");

const {
    lcoTransactionHistory
} = require("../../controllers/admin/reports/Franchisee/lcoTransactionHistory");
const {
    onlineTransaction
} = require("../../controllers/admin/reports/Franchisee/onlineTransaction");
const {
    resellerTransferBalance
} = require("../../controllers/admin/reports/Franchisee/resellerTransferBalance");

const router = express.Router();

router.get("/lcoBalanceTransfer", adminAuthenticate, lcoBalanceTransfer);
router.get("/lcoTransactionHistory", adminAuthenticate, lcoTransactionHistory);
router.get("/onlineTransaction", adminAuthenticate, onlineTransaction);
router.get("/resellerTransferBalance", adminAuthenticate, resellerTransferBalance);

module.exports = router;