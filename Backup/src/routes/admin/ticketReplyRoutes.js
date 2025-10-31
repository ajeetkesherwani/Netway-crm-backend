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

const router = express.Router();

router.post("/create", adminAuthenticate, createTicketReply);
router.get("/list/:ticketId", adminAuthenticate, ticketReplyList);

module.exports = router;