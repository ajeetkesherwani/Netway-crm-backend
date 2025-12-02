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

const {
    getResellerWiseRegisterUserDetails
} = require("../../controllers/admin/resellerWiseDashboard/resellerWiseRegisterUserDetails");

const {
    getResellerWiseActiveUserDetails
} = require("../../controllers/admin/resellerWiseDashboard/resellerWiseActiveUserDetails");

const {
    getResellerWiseInActiveUserDetails
} = require("../../controllers/admin/resellerWiseDashboard/resellerWiseInActiveUser");

const {
    getResellerWiseRenewalUserDetails
} = require("../../controllers/admin/resellerWiseDashboard/resellerWiseRenewalUserDetails");

const {
    getResellerWiseUpcomingRenewalUserDetails
} = require("../../controllers/admin/resellerWiseDashboard/resellerWiseUpcomingUserDetails");

const router = express.Router();

router.get("/register/userList", adminAuthenticate, getResellerWiseRegisterUsersCount);
router.get("/active/userList", adminAuthenticate, getResellerWiseActiveUsersCount);
router.get("/inActive/userList", adminAuthenticate, getResellerWiseInActiveUsersCount);
router.get("/renewal/userList", adminAuthenticate, getResellerWiseRenewalUsersCount);
router.get("/upcomingRenewal/userList", adminAuthenticate, getResellerWiseUpcomingRenewalUsersCount);

router.get("/register/userlist/:resellerId", adminAuthenticate, getResellerWiseRegisterUserDetails);
router.get("/active/userList/:resellerId", adminAuthenticate, getResellerWiseActiveUserDetails);
router.get("/inActive/userList/:resellerId", adminAuthenticate, getResellerWiseInActiveUserDetails);
router.get("/renewal/userList/:resellerId", adminAuthenticate, getResellerWiseRenewalUserDetails);
router.get("/upcomingRenewal/userList/:resellerId", adminAuthenticate, getResellerWiseUpcomingRenewalUserDetails);

module.exports = router;