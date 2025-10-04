const express = require("express");

const {
    adminAuthenticate
} = require("../../controllers/admin/auth/adminAuthenticate");

const {
    assignTicket
} = require("../../controllers/admin/ticketAssignToStaff/assignTIcketToStaff");


const router = express.Router();

router.post("/toStaff", adminAuthenticate, assignTicket);


module.exports = router;