const express = require("express");
const {
    adminAuthenticate
} = require("../../controllers/admin/auth/adminAuthenticate");

const {
    newRegistrationPlanReport
} = require("../../controllers/admin/reports/revenue/newRegistrationPlanReport");

const {
    paymentReport
} = require("../../controllers/admin/reports/revenue/payemntReport");

const {
    recentPurchasedOrRenewReport
} = require("../../controllers/admin/reports/revenue/recentPurchasedOrRenewReport");


const router = express.Router();

router.get("/newRegistrationPlanReport", adminAuthenticate, newRegistrationPlanReport);
router.get("/payemntReport", adminAuthenticate, paymentReport);
router.get("/recentPurchasedOrRenewReport", adminAuthenticate, recentPurchasedOrRenewReport);

module.exports = router;