const express = require("express");

const {
    adminAuthenticate
} = require("../../controllers/admin/auth/adminAuthenticate");

const {
    createTicketReply
} = require("../../controllers/admin/ticketReply/createTickerReply");

const {
    ticketReplyList
} = require("../../controllers/admin/ticketReply/getTicketReplyList");

const {
    ticketHistory
} = require("../../controllers/admin/ticketReply/ticketHistory");

const router = express.Router();

router.post("/create", adminAuthenticate, createTicketReply);
router.get("/list/:ticketId", adminAuthenticate, ticketReplyList);
router.get("/ticketHistory/:ticketId", adminAuthenticate, ticketHistory);

module.exports = router;