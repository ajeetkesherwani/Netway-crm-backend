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
        getAllRoles
    } = require("../../controllers/admin/common/getAllRoles");

const {
    getUserPurchasedPlans
} = require("../../controllers/admin/common/UserPurchedPlanList");

const { 
    getAllReassignedTickets 
} = require("../../controllers/admin/common/reAssignTicketList");

const { 
    getLogsByRoleAndId
} = require("../../controllers/admin/common/getLogsActivity");

const {
    getPackageList
} = require("../../controllers/admin/common/getPackageList");

const {
    getInvoiceList
} = require("../../controllers/admin/common/getInvoiceList");

const {
    getInvoiceDetails
} = require("../../controllers/admin/common/getInvoiceDetails");

const { 
    getUserInvoice 
} = require("../../controllers/admin/common/gerUserInoiveList");

const {
    getUserAssignedHardware
} = require("../../controllers/admin/common/getAssignedHardwareList");

const {
    getCountSummary
} = require("../../controllers/admin/common/getCounts");

const router = express.Router();

router.get("/user/details", adminAuthenticate, searchUsersByName);
router.get("/staff/roleList", adminAuthenticate, getStaffRoleList);
router.get("/staff/allRoles", adminAuthenticate, getAllRoles);
router.get("/user/purchedPlan", adminAuthenticate, getUserPurchasedPlans);
router.get("/reassign/ticket/list", adminAuthenticate, getAllReassignedTickets);
router.get("/user/Global/details/:id", adminAuthenticate, userGlobalDetails);
router.get("/logList/:role/:id", adminAuthenticate, getLogsByRoleAndId);
router.get("/filterPackage/list", adminAuthenticate, getPackageList);
router.get("/invoiceList", adminAuthenticate, getInvoiceList);
router.get("/invoice/:invoiceId", getInvoiceDetails);
router.get("/user/invoice/:userId", adminAuthenticate, getUserInvoice);
router.get("/user/hardware/:userId", adminAuthenticate, getUserAssignedHardware);
router.get("/count/summary", adminAuthenticate, getCountSummary);
module.exports = router;