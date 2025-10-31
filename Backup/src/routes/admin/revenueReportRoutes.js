const express = require("express");
const {
    adminAuthenticate
} = require("../../controllers/admin/auth/adminAuthenticate");

const {
    newRegistrationPlanReport
} = require("../../controllers/admin/reports/revenue/newRegistrationPlanReport");


const router = express.Router();

router.get("/newRegistrationPlanReport", adminAuthenticate, newRegistrationPlanReport);

module.exports = router;