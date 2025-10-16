const express = require("express");
const {
    adminAuthenticate
} = require("../../controllers/admin/auth/adminAuthenticate");

const {
    newRegistrationPlanReport
} = require("../../controllers/admin/reports/revenue/newRegistrationPlanReport");

const {
    payemntReport
} = require("../../controllers/admin/reports/revenue/payemntReport");


const router = express.Router();

router.get("/newRegistrationPlanReport", adminAuthenticate, newRegistrationPlanReport);
router.get("/payemntReport", adminAuthenticate, payemntReport);

module.exports = router;