const express = require("express");

const {
    adminAuthenticate
} = require("../../controllers/admin/auth/adminAuthenticate");

const {
    createRetailer
} = require("../../controllers/admin/retailer/createRetailer");

const {
    getRetailer
} = require("../../controllers/admin/retailer/getRetailer");

const {
    deleteRetailer
} = require("../../controllers/admin/retailer/deleteRetailer");

const {
    updateRetailer
} = require("../../controllers/admin/retailer/updateRetailer");

const {
    getRetailerDetails
} = require("../../controllers/admin/retailer/getRetailerDetail");
const {
    getAssignedPackagesByAssignToId
} = require("../../controllers/admin/retailer/getAssignPackageByToId");

const {
    addResellerEmployee
} = require("../../controllers/admin/retailer/addResellerEmployee");

const {
    getResellerEmployees
} = require("../../controllers/admin/retailer/getResellerEmployee");

const {
    updateResellerEmployee
} = require("../../controllers/admin/retailer/updateResellerEmployee");

const {
    deleteResellerEmployee
} = require("../../controllers/admin/retailer/deleteResellerEmployee");

const {
    getResellerEmployeeDetails
} = require("../../controllers/admin/retailer/getResellerEmployeeDetail");

const {
    getResellerLcos
} = require("../../controllers/admin/retailer/resellerGetOwnLco");

const fileUploader = require("../../middlewares/fileUploader");

const {
    deleteRetailerDocument
} = require("../../controllers/admin/retailer/deleteResellerDocument");



const router = express.Router();


router.post("/create", adminAuthenticate,
    fileUploader("retailerDocuments", [
        { name: "aadhaarCard", maxCount: 2 },
        { name: "panCard", maxCount: 2 },
        { name: "license", maxCount: 2 },
        { name: "other", maxCount: 6 },
    ]),
    createRetailer);
router.get("/list", adminAuthenticate, getRetailer);
router.get("/list/:id", adminAuthenticate, getRetailerDetails);
router.patch("/update/:retailerId", adminAuthenticate,
    fileUploader("retailerDocuments", [
      { name: "aadhaarCard", maxCount: 5 },
    { name: "panCard", maxCount: 5 },
    { name: "license", maxCount: 5 },
    { name: "other", maxCount: 5 },
    ]), updateRetailer);
router.delete("/delete/:id", adminAuthenticate, deleteRetailer);
router.get("/packageList/:assignToId", adminAuthenticate, getAssignedPackagesByAssignToId);
router.patch("/addEmployee/:id", adminAuthenticate, addResellerEmployee);
router.get("/employee/:resllerId", adminAuthenticate, getResellerEmployees);
router.patch("/update/:resellerId/:employeeId", adminAuthenticate, updateResellerEmployee);
router.delete("/delete/:resellerId/:employeeId", adminAuthenticate, deleteResellerEmployee);
router.get("/employee/:resellerId/:employeeId", adminAuthenticate, getResellerEmployeeDetails);
router.get("/lcoList", adminAuthenticate, getResellerLcos);
router.delete("/document/delete/:retailerId", adminAuthenticate, deleteRetailerDocument);

module.exports = router;