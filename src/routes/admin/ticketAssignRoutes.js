const express = require("express");

const {
    adminAuthenticate
} = require("../../controllers/admin/auth/adminAuthenticate");

const {
    assignTicket
} = require("../../controllers/admin/ticketAssignToStaff/assignTicketToStaff");

const {
    reAssignTicket
} = require("../../controllers/admin/ticketAssignToStaff/reAssignTicket");

const {
    getAssignToUsersList
} = require("../../controllers/admin/ticketAssignToStaff/assignToUser");


const router = express.Router();

router.post("/toStaff", adminAuthenticate, assignTicket);
router.post("/toStaff/reAssign", adminAuthenticate, reAssignTicket);
router.get("/assignToUser", adminAuthenticate, getAssignToUsersList);


module.exports = router;