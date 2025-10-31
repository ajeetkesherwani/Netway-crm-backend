const express = require("express");
const {
    adminAuthenticate
} = require("../../controllers/admin/auth/adminAuthenticate");

const {
    customerBalanceReport
} = require("../../controllers/admin/reports/mis/customerBalanceReport");

const {
    customerUpdateHistory
} = require("../../controllers/admin/reports/mis/customerUpdateHistory");

const {
    upcomingRenewalByDays
} = require("../../controllers/admin/reports/mis/upcomingRenewalByDays");

const {
    upcomingRenewalByMonth
} = require("../../controllers/admin/reports/mis/upcomingRenewalByMonth");

const router = express.Router();

router.get("/customerBalanceReport", adminAuthenticate, customerBalanceReport);
router.get("/customerUpdateHistory", adminAuthenticate, customerUpdateHistory);
router.get("/upcomingRenewalByDays", adminAuthenticate, upcomingRenewalByDays);
router.get("/upcomingRenewalByMonth", adminAuthenticate, upcomingRenewalByMonth);

module.exports = router;