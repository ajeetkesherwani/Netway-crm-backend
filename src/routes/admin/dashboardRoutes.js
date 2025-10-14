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
const { getInactiveUsersDetailByFilter } = require("../../controllers/admin/dashboard/getInactiveUserDetails");

const router = express.Router();

router.get("/register/userList", adminAuthenticate, getRegisterUsersCountByFilter);
router.get("/register/userList/details", adminAuthenticate, getRegisterUsersByFilter);

router.get("/active/userList", adminAuthenticate, getActiveUsersCountByFilter);
router.get("/active/userList/details", adminAuthenticate, getActiveUsersDetailByFilter);

router.get("/inactive/userList", adminAuthenticate, getInActiveUsersCountByFilter);
router.get("/inactive/userList/details", adminAuthenticate, getInactiveUsersDetailByFilter);

router.get("/allType/userList", adminAuthenticate, getUserByStatus);


module.exports = router;