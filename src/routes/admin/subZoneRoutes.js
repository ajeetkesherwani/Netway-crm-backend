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

const router = express.Router();
router.use(adminAuthenticate);

router.post("/", createSubzone);
router.get("/:zoneId", getSubzonesByZoneId);
router.patch("/:subzoneId", updateSubzone);
router.delete("/:subzoneId", deleteSubzone);

module.exports = router;
