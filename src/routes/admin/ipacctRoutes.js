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

const {
    testIpacctExpiry
} = require("../../controllers/admin/IpacctApis/testIpacctExpiry");

const {
    getPoolsFromIpacct
} = require("../../controllers/admin/IpacctApis/ipBillGetPools");

const router = express.Router();

router.post("/updateipPackages", adminAuthenticate, getSoapPackages);
router.get("/sync-zones", adminAuthenticate, syncIpacctZones);
router.post("/sync-user-expiry", adminAuthenticate, syncUserExpiryToIpacct);
router.post("/test-expiry", testIpacctExpiry);
router.post("/get-pools", adminAuthenticate, getPoolsFromIpacct);

module.exports = router;