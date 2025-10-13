const express = require("express");
const {
    adminAuthenticate
} = require("../../controllers/admin/auth/adminAuthenticate");

const {
    createLco
} = require("../../controllers/admin/lco/createLco");

const {
    customerBalanceReport
} = require("../../controllers/admin/reports/mis/customerBalanceReport");

const router = express.Router();

router.get("/customerBalanceReport", adminAuthenticate, customerBalanceReport);

module.exports = router;