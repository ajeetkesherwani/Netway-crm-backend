const express = require("express");

const {
    adminAuthenticate
} = require("../../controllers/admin/auth/adminAuthenticate");

const {
    getAllUsersList
} = require("../../controllers/admin/reports/subscriber/getAllUsersList");

const {
    getAllInactiveUsersList
} = require("../../controllers/admin/reports/subscriber/getAllInactiveUsersList");
const {
    getAllSuspendedUsersList
} = require("../../controllers/admin/reports/subscriber/getAllSuspendedUsersList");

const router = express.Router();

router.get("/allUsers", adminAuthenticate, getAllUsersList);
router.get("/allInactiveUsers", adminAuthenticate, getAllInactiveUsersList);
router.get("/allSuspendedUsers", adminAuthenticate, getAllSuspendedUsersList);

module.exports = router;