const express = require("express");
const router = express.Router();

const {
  adminAuthenticate,
} = require("../../controllers/admin/auth/adminAuthenticate");

const {
  createPackage,
} = require("../../controllers/admin/Package/createPackage");
const {
  getPackages,
  getPackageById,
  updatePackage,
  togglePackageStatus
} = require("../../controllers/admin/Package/packageController");



router.get("/list", adminAuthenticate, getPackages);
router.post("/create",adminAuthenticate, createPackage);
router.get("/:id", adminAuthenticate, getPackageById);
router.patch("/:id", adminAuthenticate, updatePackage);
router.patch("/toggle-status/:id", adminAuthenticate, togglePackageStatus);
module.exports = router;



