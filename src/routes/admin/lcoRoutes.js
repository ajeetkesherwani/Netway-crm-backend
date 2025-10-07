const express = require("express");
const {
    adminAuthenticate
} = require("../../controllers/admin/auth/adminAuthenticate");

const {
    createLco
} = require("../../controllers/admin/lco/createLco");

const {
    getLcoList
} = require("../../controllers/admin/lco/getLco");

const {
    getDetails
} = require("../../controllers/admin/lco/getLcoDetails");

const {
    deleteLoc
} = require("../../controllers/admin/lco/deleteLoc");

const {
    updateLco
} = require("../../controllers/admin/lco/updateLco");

const {
    addLcoEmployee
} = require("../../controllers/admin/lco/addLcoEmployee");

const router = express.Router();

router.post("/create", adminAuthenticate, createLco);
router.get("/list", adminAuthenticate, getLcoList);
router.get("/list/:id", adminAuthenticate, getDetails);
router.patch("/update/:lcoId", adminAuthenticate, updateLco);
router.delete("/delet/:id", adminAuthenticate, deleteLoc);
router.patch("/addEmployee/:id", adminAuthenticate, addLcoEmployee);

module.exports = router;