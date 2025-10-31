const express = require("express");

const {
    adminAuthenticate
} = require("../../controllers/admin/auth/adminAuthenticate");

const {
    createZone
} = require("../../controllers/admin/zone/createZone");

const {
    getZoneList
} = require("../../controllers/admin/zone/zoneList");

const {
    updateZone
} = require("../../controllers/admin/zone/updateZone");

const {
    deleteZone
} = require("../../controllers/admin/zone/deleteZone");

const router = express.Router();

router.post("/create", adminAuthenticate, createZone);
router.get("/list", adminAuthenticate, getZoneList);
router.patch("/update/:zoneId", adminAuthenticate, updateZone);
router.delete("/delete/:zoneId", adminAuthenticate, deleteZone);

module.exports = router;
