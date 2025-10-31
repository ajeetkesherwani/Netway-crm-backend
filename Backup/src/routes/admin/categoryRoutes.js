const express = require("express");

const {
    adminAuthenticate
} = require("../../controllers/admin/auth/adminAuthenticate");

const {
    createCategory
} = require("../../controllers/admin/ticketCategory/createCategory");

const {
    getTicketCategoryList
} = require("../../controllers/admin/ticketCategory/categoryList");

const {
    updateTicketCategory
} = require("../../controllers/admin/ticketCategory/updateTicketCategory");

const {
    deleteTicketCategory
} = require("../../controllers/admin/ticketCategory/deleteCategory");

const router = express.Router();

router.post("/create", adminAuthenticate, createCategory);
router.get("/list", adminAuthenticate, getTicketCategoryList);
router.patch("/update/:categoryId", adminAuthenticate, updateTicketCategory);
router.delete("/delete/:categoryId", adminAuthenticate, deleteTicketCategory);

module.exports = router;