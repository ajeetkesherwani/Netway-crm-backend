const express = require("express");

const {
    adminAuthenticate
} = require("../../controllers/admin/auth/adminAuthenticate");

const { 
    getSoapPackages 
} = require("../../controllers/admin/IpacctApis/ipBillGetAllPackages");

const {
    syncIpacctZones
} = require("../../controllers/admin/IpacctApis/ipBillGetZones");

const {
    syncUserExpiryToIpacct
} = require("../../controllers/admin/IpacctApis/ipBillSyncUserExpiry");

const router = express.Router();

router.post("/updateipPackages", adminAuthenticate, getSoapPackages);
router.get("/sync-zones", adminAuthenticate, syncIpacctZones);
router.post("/sync-user-expiry", adminAuthenticate, syncUserExpiryToIpacct);

module.exports = router;