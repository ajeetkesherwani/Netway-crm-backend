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


const router = express.Router();

router.post("/toStaff", adminAuthenticate, assignTicket);
router.post("/toStaff/reAssign", adminAuthenticate, reAssignTicket);


module.exports = router;