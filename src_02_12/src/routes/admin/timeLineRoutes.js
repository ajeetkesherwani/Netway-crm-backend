const express = require("express");

const {
    adminAuthenticate
} = require("../../controllers/admin/auth/adminAuthenticate");
const { getTicketTimeLineHistory } = require("../../controllers/admin/timeLineHistory/getTimeLineHistory");


const router = express.Router();

router.get("/list/:ticketId", adminAuthenticate, getTicketTimeLineHistory);

module.exports = router;
