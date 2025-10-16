const express = require("express");

const {
    adminAuthenticate
} = require("../../controllers/admin/auth/adminAuthenticate");

const {
    changePlanExpiry
} = require("../../controllers/admin/user/changeExpiryDate");

const {
    updateUserStatus
} = require("../../controllers/admin/user/changeUserStatus");

const {
    getUserPassword
} = require("../../controllers/admin/user/viewPassword");

const {
    getUserWalletHistoryList
} = require("../../controllers/admin/user/userWalletHistoryList");
const {
    makePayment
} = require("../../controllers/admin/user/makePayment");

const router = express.Router();

router.patch("/change-expiryDate", adminAuthenticate, changePlanExpiry);
router.patch("/update-status", adminAuthenticate, updateUserStatus);
router.get("/view-passowrd/:userId", adminAuthenticate, getUserPassword);
router.get("/wallet/list/:userId", adminAuthenticate, getUserWalletHistoryList);
router.post("/makePayment", adminAuthenticate, makePayment);


module.exports = router;