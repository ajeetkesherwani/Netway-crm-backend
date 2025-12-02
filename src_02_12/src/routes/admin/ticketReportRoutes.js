const express = require("express");

const {
    adminAuthenticate
} = require("../../controllers/admin/auth/adminAuthenticate");

const {
    getOpenTicketList
} = require("../../controllers/admin/reports/ticket/openTicket");

const {
    getCloseTicketList
} = require("../../controllers/admin/reports/ticket/closedTicket");

const {
    getFixedTicketList
} = require("../../controllers/admin/reports/ticket/fixedTicket");

const {
    getAssignedTicketList
} = require("../../controllers/admin/reports/ticket/assignedTicket");

const {
    getNonAssignedTicketList
} = require("../../controllers/admin/reports/ticket/nonAssignedTicket");

const {
    getResolvedTicketList
} = require("../../controllers/admin/reports/ticket/resolvedTicket");

const router = express.Router();

router.get("/openTicket", adminAuthenticate, getOpenTicketList);
router.get("/closeTicket", adminAuthenticate, getCloseTicketList);
router.get("/fixedTicket", adminAuthenticate, getFixedTicketList);
router.get("/assignedTicket", adminAuthenticate, getAssignedTicketList);
router.get("/nonAssignedTicket", adminAuthenticate, getNonAssignedTicketList);
router.get("/resolvedTicket", adminAuthenticate, getResolvedTicketList);


module.exports = router;