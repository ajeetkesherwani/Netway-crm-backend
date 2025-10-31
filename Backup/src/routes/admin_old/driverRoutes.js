const express = require("express");

const { 
    adminAuthenticate 
} = require("../../controllers/admin/auth/adminAuthenticate");

const { 
    getAllDriver 
} = require("../../controllers/admin/driverController/getAllDriver");

const { 
    getDriverDetail 
} = require("../../controllers/admin/driverController/getDriverDetail");

const { 
    deleteDriver 
} = require("../../controllers/admin/driverController/deleteDriver");

const { 
    updateDriverStatus 
} = require("../../controllers/admin/driverController/updateDriverStatus");

const { 
    updateDriverBlockStatus 
} = require("../../controllers/admin/driverController/isBlockStatusUpdate");

const router = express.Router();

router.get("/list", adminAuthenticate, getAllDriver);
router.get("/list/:driverId", adminAuthenticate, getDriverDetail);
router.delete("/delete/:driverId", adminAuthenticate, deleteDriver);
router.patch("/update/status/:driverId", adminAuthenticate, updateDriverStatus);
router.patch("/update/block/status/:driverId", adminAuthenticate, updateDriverBlockStatus);

module.exports = router;