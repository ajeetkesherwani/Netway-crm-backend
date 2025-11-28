const express = require("express");

const {
  userAuthenticate,
} = require("../../controllers/user/authController/userAuthenticate");

const{
    createUserTicket
} = require("../../controllers/user/tickets/createUserTicket");

const {
    getUserTicketList
} = require("../../controllers/user/tickets/getUserTicketList");

const {
    getUserTicketCategoryList
} = require("../../controllers/user/tickets/categoryList");

const {
    getUserTicketDetails
} = require("../../controllers/user/tickets/getTicketDetails");

const {
    userReplyToTicket
} = require("../../controllers/user/tickets/ticketReplyCreate");

const router = express.Router();

router.post("/create", userAuthenticate, createUserTicket);
router.get("/list", userAuthenticate, getUserTicketList);
router.get("/details/:ticketId", userAuthenticate, getUserTicketDetails);
router.get("/categoy/list", userAuthenticate, getUserTicketCategoryList);
router.post("/reply/:ticketId", userAuthenticate, userReplyToTicket);

module.exports = router;