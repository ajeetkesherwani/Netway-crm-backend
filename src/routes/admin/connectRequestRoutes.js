const express = require("express");
const {
    adminAuthenticate
} = require("../../controllers/admin/auth/adminAuthenticate");  
const {
    getAllConnectionRequestList
} = require("../../controllers/admin/connectionRequest/getConnectionRequestList");
const router = express.Router();

router.get("/list", adminAuthenticate, getAllConnectionRequestList);
module.exports = router;