const express = require("express");

const {
    adminAuthenticate
} = require("../../controllers/admin/auth/adminAuthenticate");

const {
    createTicket
} = require("../../controllers/admin/ticket/createTicket");

const fileUploader = require("../../middlewares/fileUploader");

const {
    getTicketList
} = require("../../controllers/admin/ticket/getTicket");

const {
    getTicketDetails
} = require("../../controllers/admin/ticket/getTicketDetails");

const {
    updateTicketStatus
} = require("../../controllers/admin/ticket/updateTicketStatus");
const {
    updateTicket
} = require("../../controllers/admin/ticket/updateTicket");

const {
    deleteTicket
} = require("../../controllers/admin/ticket/deleteTicket");

const router = express.Router();

router.post("/create",
    fileUploader("ticket",
        [
            { name: "fileI", maxCount: 1 },
            { name: "fileII", maxCount: 1 },
            { name: "fileIII", maxCount: 1 }
        ]
    ),
    adminAuthenticate, createTicket);
router.get("/list", adminAuthenticate, getTicketList);
router.get("/view/:ticketId", adminAuthenticate, getTicketDetails);
router.patch("/status/:ticketId", adminAuthenticate, updateTicketStatus);
router.patch("/update/:ticketId", adminAuthenticate, 
    fileUploader("ticket",
        [
            { name: "fileI", maxCount: 1 },
            { name: "fileII", maxCount: 1 },
            { name: "fileIII", maxCount: 1 }
        ]
    ),
    updateTicket);
router.delete("/delete/:ticketId", adminAuthenticate, deleteTicket);

module.exports = router;
