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

const router = express.Router();

router.get("/register/userList/:resellerId", adminAuthenticate, getLcoWiseUserRegisterCountByReseller);
router.get("/active/userList/:resellerId", adminAuthenticate, getLcoWiseActiveUserCountByReseller);
router.get("/inActive/userList/:resellerId", adminAuthenticate, getLcoWiseInActiveUserCountByReseller);
router.get("/renewal/userList/:resellerId", adminAuthenticate, getLcoWiseRenewedUserCountByReseller);

module.exports = router;