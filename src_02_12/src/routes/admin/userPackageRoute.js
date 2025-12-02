const express = require("express");

const {
    adminAuthenticate
} = require("../../controllers/admin/auth/adminAuthenticate");      

const {
    assignPackageToUser
} = require("../../controllers/admin/packageForUser/assignPackageToUser");

const {
    assignPackageListByUserId
} = require("../../controllers/admin/packageForUser/assignPackageList");


const {
        updateUserPackageStatus
} = require("../../controllers/admin/packageForUser/assignPackageStatusChange"); 

const {
    getAvailablePackagesForUser
}   = require("../../controllers/admin/packageForUser/getPackageForUser");

const {
    deleteAssignedPackage
} = require("../../controllers/admin/packageForUser/assginPackageDelete");


const router = express.Router(); 

router.post("/assign/:userId", adminAuthenticate, assignPackageToUser);
router.get("/assign/list/:userId", adminAuthenticate, assignPackageListByUserId);
router.patch("/update/:packageId", adminAuthenticate, updateUserPackageStatus);
router.get("/package/list/:userId", adminAuthenticate, getAvailablePackagesForUser);
router.delete("/delete/:packageId", adminAuthenticate, deleteAssignedPackage);

module.exports = router;