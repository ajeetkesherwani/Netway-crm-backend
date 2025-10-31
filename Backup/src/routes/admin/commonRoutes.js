const express = require("express");

const {
    adminAuthenticate
} = require("../../controllers/admin/auth/adminAuthenticate");

const {
    searchUsersByName
} = require("../../controllers/admin/common/getUserByName");

const router = express.Router();

router.get("/user/details", adminAuthenticate, searchUsersByName);

module.exports = router;