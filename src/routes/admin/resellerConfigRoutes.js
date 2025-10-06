const express = require("express");

const {
    adminAuthenticate
} = require("../../controllers/admin/auth/adminAuthenticate");

const {
    createResellerConfig
} = require("../../controllers/admin/resellerConfig/createResellerConfig");

const {
    getResellerConfigList
} = require("../../controllers/admin/resellerConfig/getResellerConfigList");

const {
    updateResellerConfig
} = require("../../controllers/admin/resellerConfig/updateResellerConfig");

const {
    deleteResellerConfig
} = require("../../controllers/admin/resellerConfig/deleteResellerConfig");

const router = express.Router();

router.post("/create", adminAuthenticate, createResellerConfig);
router.get("/list", adminAuthenticate, getResellerConfigList);
router.patch("/update/:id", adminAuthenticate, updateResellerConfig);
router.delete("/delete/:id", adminAuthenticate, deleteResellerConfig);

module.exports = router;