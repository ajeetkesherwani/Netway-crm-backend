const express = require("express");

const {
    adminAuthenticate
} = require("../../controllers/admin/auth/adminAuthenticate");

const {
    getRegisterUsers
} = require("../../controllers/admin/dashboard/registerUser");

const {
    getUserByStatus
} = require("../../controllers/admin/dashboard/allTypeUser");

const {
    getAllActiveUsers
} = require("../../controllers/admin/dashboard/activeUser");

const {
    getAllInActiveUsers
} = require("../../controllers/admin/dashboard/inActiveUser");
const { getRegisterUsersByFilter } = require("../../controllers/admin/dashboard/getRegisterdUserDetail");

const router = express.Router();

router.get("/register/userList", adminAuthenticate, getRegisterUsers);
router.get("/allType/userList", adminAuthenticate, getUserByStatus);
router.get("/active/userList", adminAuthenticate, getAllActiveUsers);
router.get("/inactive/userList", adminAuthenticate, getAllInActiveUsers);
router.get("/register/userList/details", adminAuthenticate, getRegisterUsersByFilter);

module.exports = router;