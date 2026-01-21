const express = require("express");
const router = express.Router();

const {
  adminAuthenticate,
} = require("../../controllers/admin/auth/adminAuthenticate");

const {
  createPackage,
} = require("../../controllers/admin/Package/createPackage");

const {
  getPackages
} = require("../../controllers/admin/Package/getPackages");

const {
  getPackagesDetails
} = require("../../controllers/admin/Package/getPackagesDetails");

const {
  updatePackage
} = require("../../controllers/admin/Package/updatePackage");

const {
  deletePackage
} = require("../../controllers/admin/Package/deletePackage");

const {
  getIptvPackages
} = require("../../controllers/admin/Package/getIpTvPackageList");

const { 
  getOttPackageList 
} = require("../../controllers/admin/Package/getOttPackageList");



router.get("/list", adminAuthenticate, getPackages);
router.get("/iptv-packages/list",  getIptvPackages);
router.post("/create",  createPackage);
router.get("/:id", adminAuthenticate, getPackagesDetails);
router.patch("/update/:packageId", adminAuthenticate, updatePackage);
router.delete("/delete/:packageId", adminAuthenticate, deletePackage);
router.get("/ott-package/list", adminAuthenticate, getOttPackageList);

module.exports = router;



