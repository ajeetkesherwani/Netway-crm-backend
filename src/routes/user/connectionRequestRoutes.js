const express = require("express");

const { 
    createConnectionRequest 
} = require("../../controllers/user/connectionRequest/createConnetionRequest");

const {
    getConnectionRequestList
} = require("../../controllers/user/connectionRequest/getConnectionRequestList")

const router = express.Router();


router.post("/create", createConnectionRequest);    
router.get("/list", getConnectionRequestList)

module.exports = router;