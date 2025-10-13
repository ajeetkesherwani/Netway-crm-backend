const express = require("express");

const {
    adminAuthenticate
} = require("../../controllers/admin/auth/adminAuthenticate");

const {
    getRegisterUsers
} = require("../../controllers/admin/dashboard/registerUser");

const router = express.Router();

router.get("/register/userList", adminAuthenticate, getRegisterUsers);

module.exports = router;