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



router.get("/list", adminAuthenticate, getPackages);
router.post("/create",adminAuthenticate, createPackage);
router.get("/:id", adminAuthenticate, getPackagesDetails); 

module.exports = router;



