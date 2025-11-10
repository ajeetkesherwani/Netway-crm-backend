const express = require("express");

const {
    adminAuthenticate
} = require("../../controllers/admin/auth/adminAuthenticate");

const {
    searchUsersByName
} = require("../../controllers/admin/common/getUserByName");

const {
    userGlobalDetails
} = require("../../controllers/admin/common/userGlobalDetails");

const {
    getStaffRoleList
} = require("../../controllers/admin/common/getStaffRoleList");

const {
    getUserPurchasedPlans
} = require("../../controllers/admin/common/UserPurchedPlanList");
const { getAllReassignedTickets } = require("../../controllers/admin/common/reAssignTicketList");

const router = express.Router();

router.get("/user/details", adminAuthenticate, searchUsersByName);
router.get("/staff/roleList", adminAuthenticate, getStaffRoleList);
router.get("/user/purchedPlan", adminAuthenticate, getUserPurchasedPlans);
router.get("/reassign/ticket/list", adminAuthenticate, getAllReassignedTickets);
router.get("/user/Global/details/:id", adminAuthenticate, userGlobalDetails);

module.exports = router;