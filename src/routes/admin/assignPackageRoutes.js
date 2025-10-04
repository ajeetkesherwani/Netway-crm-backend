const express = require("express");

const { 
    assignPackageToReseller
} = require("../../controllers/admin/assignPackage/assignPackage");

const { 
    adminAuthenticate 
} = require("../../controllers/admin/auth/adminAuthenticate");

const { 
    getAssignedPackagesByAssignToId 
} = require("../../controllers/admin/retailer/getAssignPackageByToId");

const { 
    getPackages 
} = require("../../controllers/admin/assignPackage/getPackagesList");

const { 
    getAssignedPackageDetails 
} = require("../../controllers/admin/retailer/getAssignPackageDetails");

const router = express.Router();

router.post("/create", adminAuthenticate, assignPackageToReseller);
router.get("/list", adminAuthenticate, getPackages);
router.get("/packageList/:assignToId", adminAuthenticate, getAssignedPackagesByAssignToId);
router.get("/packageList/:assignToId/:packageId", adminAuthenticate, getAssignedPackageDetails);

module.exports = router;