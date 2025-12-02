const express = require("express");

const {
    adminAuthenticate
} = require("../../controllers/admin/auth/adminAuthenticate");

const {
    getRegisterUsersCountByFilter
} = require("../../controllers/admin/dashboard/registerUser");

const {
    getUserByStatus
} = require("../../controllers/admin/dashboard/allTypeUser");

const {
    getActiveUsersCountByFilter
} = require("../../controllers/admin/dashboard/activeUser");

const {
    getInActiveUsersCountByFilter
} = require("../../controllers/admin/dashboard/inActiveUser");

const {
    getRegisterUsersByFilter
} = require("../../controllers/admin/dashboard/getRegisterdUserDetail");

const {
    getActiveUsersDetailByFilter
} = require("../../controllers/admin/dashboard/getActiveUserDetails");

const {
    getInactiveUsersDetailByFilter
} = require("../../controllers/admin/dashboard/getInactiveUserDetails");

const {
    getUpcomingRenewalUsersCount
} = require("../../controllers/admin/dashboard/upcomingRenewal");

const {
    getUpcomingRenewalUsersDetails
} = require("../../controllers/admin/dashboard/getUpacomingRenewalDetails");

const {
    getRenewedUsersCountByFilter
} = require("../../controllers/admin/dashboard/renewal");

const {
    getRenewedUsersDetailsByFilter
} = require("../../controllers/admin/dashboard/getRenewalUserDetails");

const {
    getLatestPurchasedPlans
} = require("../../controllers/admin/dashboard/getLetestPurchesedPlan");

const router = express.Router();

router.get("/register/userList", adminAuthenticate, getRegisterUsersCountByFilter);
router.get("/register/userList/details", adminAuthenticate, getRegisterUsersByFilter);

router.get("/active/userList", adminAuthenticate, getActiveUsersCountByFilter);
router.get("/active/userList/details", adminAuthenticate, getActiveUsersDetailByFilter);

router.get("/inactive/userList", adminAuthenticate, getInActiveUsersCountByFilter);
router.get("/inactive/userList/details", adminAuthenticate, getInactiveUsersDetailByFilter);

router.get("/upcomig-renewal/userList", adminAuthenticate, getUpcomingRenewalUsersCount);
router.get("/upcoming-renewal/userList/details", adminAuthenticate, getUpcomingRenewalUsersDetails);

router.get("/renewal/userList", adminAuthenticate, getRenewedUsersCountByFilter);
router.get("/renewal/userList/details", adminAuthenticate, getRenewedUsersDetailsByFilter);

router.get("/allType/userList", adminAuthenticate, getUserByStatus);

router.get("/recent/plan/list", adminAuthenticate, getLatestPurchasedPlans);



module.exports = router;