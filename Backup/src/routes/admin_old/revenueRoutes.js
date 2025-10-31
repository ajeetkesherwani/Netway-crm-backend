const express = require("express");

const { 
    adminAuthenticate 
} = require("../../controllers/admin/auth/adminAuthenticate");

const { 
    getTotalRevenue 
} = require("../../controllers/admin/revenueController/totalRevenue");

const { 
    getLastYearRevenue 
} = require("../../controllers/admin/revenueController/getRevenueByMonthly");

const router = express.Router();

router.get("/list", adminAuthenticate, getTotalRevenue );
router.get("/list/revenue", adminAuthenticate, getLastYearRevenue);

module.exports = router;
