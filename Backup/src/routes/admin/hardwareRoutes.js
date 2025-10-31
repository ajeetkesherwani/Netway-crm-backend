const express = require("express");

const {
    adminAuthenticate
} = require("../../controllers/admin/auth/adminAuthenticate");

const {
    createHardware
} = require("../../controllers/admin/hardware/createHardware");

const {
    getHardwareList
} = require("../../controllers/admin/hardware/getHardwareList");

const {
    getHardwareDetails
} = require("../../controllers/admin/hardware/getHardwareDetails");

const {
    deletHardware
} = require("../../controllers/admin/hardware/deleteHardware");

const {
    updateHardware
} = require("../../controllers/admin/hardware/updateHardware");

//assign hardware

const {
    assignHardwareToUser
} = require("../../controllers/admin/assignHardwareToUser/assignHardware");

const router = express.Router();

router.post("/create", adminAuthenticate, createHardware);
router.get("/list", adminAuthenticate, getHardwareList);
router.get("/list/:hardwareId", adminAuthenticate, getHardwareDetails);
router.delete("/delete/:hardwareId", adminAuthenticate, deletHardware);
router.patch("/update/:hardwareId", adminAuthenticate, updateHardware);

//assgin hardware
router.post("/assign-hardware", adminAuthenticate, assignHardwareToUser);

module.exports = router;