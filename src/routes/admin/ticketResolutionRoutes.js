const express = require("express");

const {
    adminAuthenticate
} = require("../../controllers/admin/auth/adminAuthenticate");

const {
    createResolution
} = require("../../controllers/admin/ticketResolution/createResolution");

const {
    getTicketResolutionList
} = require("../../controllers/admin/ticketResolution/getTicketResolutionList");

const {
    updateTicketResolution
} = require("../../controllers/admin/ticketResolution/updateResolution");

const {
    getTicketResolutionById
} = require("../../controllers/admin/ticketResolution/getResolutionById");

const {
    deleteTicketResolution
} = require("../../controllers/admin/ticketResolution/deleteResolution");

const router = express.Router();

router.post("/create", adminAuthenticate, createResolution);
router.get("/list", adminAuthenticate, getTicketResolutionList);
router.patch("/update/:resolutionId", adminAuthenticate, updateTicketResolution);
router.get("/get/:resolutionId", adminAuthenticate, getTicketResolutionById);
router.delete("/delete/:resolutionId", adminAuthenticate, deleteTicketResolution);

module.exports = router;