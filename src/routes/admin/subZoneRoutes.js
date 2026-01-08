const express = require("express");

const {
  adminAuthenticate,
} = require("../../controllers/admin/auth/adminAuthenticate");
const {
  createSubzone,
} = require("../../controllers/admin/subZone/createSubzone");
const {
  getSubzonesByZoneId,
} = require("../../controllers/admin/subZone/getSubzonesByZoneId");
const {
  updateSubzone,
} = require("../../controllers/admin/subZone/updateSubzone");
const {
  deleteSubzone,
} = require("../../controllers/admin/subZone/deleteSubzone");

const { getAllSubZone } = require("../../controllers/admin/subZone/getAllSubZone");

const {
  getSubzoneListByZoneId,
} = require("../../controllers/admin/subZone/getSubzoneByZoneId");


const router = express.Router();
router.use(adminAuthenticate);

router.post("/", createSubzone);
router.get("/list", getAllSubZone);
router.get("/:zoneId", getSubzonesByZoneId);
router.patch("/:subzoneId", updateSubzone);
router.delete("/:subzoneId", deleteSubzone);
router.get("/subzone/list/:zoneId", getSubzoneListByZoneId);

module.exports = router;
