const express = require("express");

const {
    adminAuthenticate
} = require("../../controllers/admin/auth/adminAuthenticate");

const {
    getResellerWiseRegisterUsersCount
} = require("../../controllers/admin/resellerWiseDashboard/resellerWiseRegisterUser");

const {
    getResellerWiseActiveUsersCount
} = require("../../controllers/admin/resellerWiseDashboard/resellerWiseActiveUser");

const {
    getResellerWiseInActiveUsersCount
} = require("../../controllers/admin/resellerWiseDashboard/reselleWiseInActiveUser");

const {
    getResellerWiseRenewalUsersCount
} = require("../../controllers/admin/resellerWiseDashboard/resellerWiseRenewalUser");

const {
    getResellerWiseUpcomingRenewalUsersCount
} = require("../../controllers/admin/resellerWiseDashboard/resellerWiseUpcmingRenewalUser");

const router = express.Router();

router.get("/register/userList", adminAuthenticate, getResellerWiseRegisterUsersCount);
router.get("/active/userList", adminAuthenticate, getResellerWiseActiveUsersCount);
router.get("/inActive/userList", adminAuthenticate, getResellerWiseInActiveUsersCount);
router.get("/renewal/userList", adminAuthenticate, getResellerWiseRenewalUsersCount);
router.get("/upcomingRenewal/userList", adminAuthenticate, getResellerWiseUpcomingRenewalUsersCount);

module.exports = router;