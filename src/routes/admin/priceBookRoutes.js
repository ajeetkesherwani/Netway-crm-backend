const express = require("express");

const {
    adminAuthenticate,
} = require("../../controllers/admin/auth/adminAuthenticate");

const {
    createPriceBook
} = require("../../controllers/admin/priceBook/createAndAssignPackage");

const {
    getPricebookList
} = require("../../controllers/admin/priceBook/getPricebookList");

const {
    getPricebookDetails
} = require("../../controllers/admin/priceBook/getPricebookDetails");


const router = express.Router();

router.post("/create", adminAuthenticate, createPriceBook);
router.get("/list", adminAuthenticate, getPricebookList);
router.get("/list/:pricebookId", adminAuthenticate, getPricebookDetails);

module.exports = router;
