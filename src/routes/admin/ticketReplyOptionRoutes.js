const express = require("express");

const {
    adminAuthenticate
} = require("../../controllers/admin/auth/adminAuthenticate");

const {
    createReplyOption
} = require("../../controllers/admin/ticketReplyOption/createReplyOption");

const {
    getTicketReplyOptionList
} = require("../../controllers/admin/ticketReplyOption/replyOptionList");

const {
    updateTicketReplyOption
} = require("../../controllers/admin/ticketReplyOption/updateReplyOption");

const {
    getTicketReplyOptionById
} = require("../../controllers/admin/ticketReplyOption/getReplyOptionById");

const {
    deleteTicketReplyOption
} = require("../../controllers/admin/ticketReplyOption/deleteReplyOption");

const router = express.Router();

router.post("/create", adminAuthenticate, createReplyOption);
router.get("/list", adminAuthenticate, getTicketReplyOptionList);
router.patch("/update/:replyOptionId", adminAuthenticate, updateTicketReplyOption);
router.get("/get/:replyOptionId", adminAuthenticate, getTicketReplyOptionById);
router.delete("/delete/:replyOptionId", adminAuthenticate, deleteTicketReplyOption);

module.exports = router;