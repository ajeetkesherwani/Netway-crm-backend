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

const {
    getIpacctUserDetails
} = require("../../controllers/admin/IpacctApis/ipBillGetUser");

const {
    listIpacctUsersController
} = require("../../controllers/admin/IpacctApis/ipBillListUsers");

const {
    getPoolIpsController
} = require("../../controllers/admin/IpacctApis/ipBillGetPoolIps");

const router = express.Router();

router.post("/updateipPackages", adminAuthenticate, getSoapPackages);
router.get("/sync-zones", adminAuthenticate, syncIpacctZones);
router.post("/sync-user-expiry", adminAuthenticate, syncUserExpiryToIpacct);
router.post("/test-expiry", testIpacctExpiry);
router.post("/get-pools", adminAuthenticate, getPoolsFromIpacct);

// IPACCT ipbillGetUser endpoint for Postman testing
router.post("/get-user", getIpacctUserDetails);
router.get("/get-user/:id", getIpacctUserDetails);
router.get("/get-user", getIpacctUserDetails);

// IPACCT listUsers endpoint for Postman testing
router.post("/list-users", listIpacctUsersController);
router.get("/list-users", listIpacctUsersController);
router.post("/listUsers", listIpacctUsersController);
router.get("/listUsers", listIpacctUsersController);

// IPACCT getPoolFreeIps endpoint for Postman testing
router.get("/get-pool-ips", getPoolIpsController);
router.get("/get-pool-ips/:poolId", getPoolIpsController);
router.get("/pool-ips", getPoolIpsController);
router.get("/pool-ips/:poolId", getPoolIpsController);
router.post("/get-pool-ips", getPoolIpsController);
router.post("/pool-ips", getPoolIpsController);

module.exports = router;