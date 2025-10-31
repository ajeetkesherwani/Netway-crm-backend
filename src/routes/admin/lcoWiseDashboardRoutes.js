const express = require("express");

const {
    adminAuthenticate
} = require("../../controllers/admin/auth/adminAuthenticate");

const {
    getLcoWiseUserRegisterCountByReseller
} = require("../../controllers/admin/lcoWiseDashboard/lcoWiseRegisterUser");

const {
    getLcoWiseActiveUserCountByReseller
} = require("../../controllers/admin/lcoWiseDashboard/lcoWiseActiveUser");

const {
    getLcoWiseInActiveUserCountByReseller
} = require("../../controllers/admin/lcoWiseDashboard/lcoWiseInactiveUser");

const {
    getLcoWiseRenewedUserCountByReseller
} = require("../../controllers/admin/lcoWiseDashboard/lcoWiseRenewUser");

const {
    getLcoWiseUpcomingRenewalUsers
} = require("../../controllers/admin/lcoWiseDashboard/lcoWiseUpcomingRenewalUser");

const {
    getLcoWiseRegisterUserDetails
} = require("../../controllers/admin/lcoWiseDashboard/lcoWiseRegisterUserDetails");

const {
    getLcoWiseActiveUserDetails
} = require("../../controllers/admin/lcoWiseDashboard/lcoWiseActiveUserDetails");

const {
    getLcoWiseInActiveUserDetails
} = require("../../controllers/admin/lcoWiseDashboard/lcoWiseInActiveUserDetails");

const {
    getLcoWiseRenewalUserDetails
} = require("../../controllers/admin/lcoWiseDashboard/lcoWiseRenewalUserDetails");

const {
    getLcoWiseUpcomingRenewalUserDetails
} = require("../../controllers/admin/lcoWiseDashboard/lcoWiseUpcomingRenwalUserDetails");

const router = express.Router();

router.get("/register/userList/:resellerId", adminAuthenticate, getLcoWiseUserRegisterCountByReseller);
router.get("/active/userList/:resellerId", adminAuthenticate, getLcoWiseActiveUserCountByReseller);
router.get("/inActive/userList/:resellerId", adminAuthenticate, getLcoWiseInActiveUserCountByReseller);
router.get("/renewal/userList/:resellerId", adminAuthenticate, getLcoWiseRenewedUserCountByReseller);
router.get("/upcomingRenewal/userList/:resellerId", adminAuthenticate, getLcoWiseUpcomingRenewalUsers);

router.get("/userList/details/:lcoId", adminAuthenticate, getLcoWiseRegisterUserDetails);
router.get("/active/userList/details/:lcoId", adminAuthenticate, getLcoWiseActiveUserDetails);
router.get("/inActive/userList/details/:lcoId", adminAuthenticate, getLcoWiseInActiveUserDetails);
router.get("/renewal/userList/details/:lcoId", adminAuthenticate, getLcoWiseRenewalUserDetails);
router.get("/upcomingRenewal/userList/details/:lcoId", adminAuthenticate, getLcoWiseUpcomingRenewalUserDetails);


module.exports = router;