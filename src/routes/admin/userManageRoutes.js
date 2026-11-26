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
    changeUserPassword
} = require("../../controllers/admin/user/changePassword");
const { authorize } = require("../../middlewares/authorize");

const router = express.Router();

const authorizeStaffPermission = (action) => (req, res, next) => {
    const isStaff = req.user?.accountType === "staff" || req.user?.role === "Staff";
    if (!isStaff) return next();
    return authorize("customer", action)(req, res, next);
};

router.patch("/change-expiryDate", adminAuthenticate, changePlanExpiry);
router.patch("/update-status", adminAuthenticate, authorizeStaffPermission("UpdateStatus"), updateUserStatus);
router.get("/view-passowrd/:userId", adminAuthenticate, getUserPassword);
router.get("/wallet/list/:userId", adminAuthenticate, getUserWalletHistoryList);
router.patch("/password-reset/:userId", adminAuthenticate, changeUserPassword);


module.exports = router;