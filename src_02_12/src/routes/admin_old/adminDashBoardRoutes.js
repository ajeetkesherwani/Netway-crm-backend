const express = require("express");

const { 
    adminAuthenticate 
} = require("../../controllers/admin/auth/adminAuthenticate");

const { 
    getAdminDashboardData 
} = require("../../controllers/admin/adminDashBoardController/dashBoard");

const router = express.Router();

router.get("/list", adminAuthenticate, getAdminDashboardData );

module.exports = router;