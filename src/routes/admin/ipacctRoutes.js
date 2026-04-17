const express = require("express");

const {
    adminAuthenticate
} = require("../../controllers/admin/auth/adminAuthenticate");

const { 
    getSoapPackages 
} = require("../../controllers/admin/IpacctApis/ipBillGetAllPackages");

const router = express.Router();

router.get("/updateipPackages", adminAuthenticate, getSoapPackages)

module.exports = router;