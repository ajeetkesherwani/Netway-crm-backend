const express = require("express");

const {
    adminAuthenticate
} = require("../../controllers/admin/auth/adminAuthenticate");

const {
    changePlanExpiry
} = require("../../controllers/user/AccountController/changeExpiryDate");

const {
    updateUserStatus
} = require("../../controllers/user/AccountController/changeUserStatus");
const { getUserPassword } = require("../../controllers/user/userPasswordController/viewPassword");

const router = express.Router();

router.patch("/change-expiryDate", adminAuthenticate, changePlanExpiry);
router.patch("/update-status", adminAuthenticate, updateUserStatus);
router.get("/view-passowrd/:userId", adminAuthenticate, getUserPassword);


module.exports = router;