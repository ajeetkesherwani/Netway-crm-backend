const express = require("express");

const {
    adminAuthenticate
} = require("../../controllers/admin/auth/adminAuthenticate");

const {
    getAllUsersList
} = require("../../controllers/admin/reports/subscriber/getAllUsersList");

const router = express.Router();

router.get("/allUsers", adminAuthenticate, getAllUsersList);

module.exports = router;