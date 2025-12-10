const express = require("express");

const {
    adminAuthenticate
} = require("../../controllers/admin/auth/adminAuthenticate");

const {
    createStaff
} = require("../../controllers/admin/staff/createStaff");

const {
    getStaff
} = require("../../controllers/admin/staff/getStaff");

const {
    deleteStaff
} = require("../../controllers/admin/staff/deleteStaff");

const {
    getStaffDetails
} = require("../../controllers/admin/staff/getStaffDetails");

const { updateStaff } = require("../../controllers/admin/staff/updateStaff");

const router = express.Router();

router.post("/create", adminAuthenticate, createStaff);
router.get("/list", adminAuthenticate, getStaff);
router.get("/list/:staffId", adminAuthenticate, getStaffDetails);
router.patch("/update/:id", adminAuthenticate, updateStaff);
router.delete("/delete/:id", adminAuthenticate, deleteStaff);

module.exports = router;