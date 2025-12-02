const express = require("express");

const { 
    getAllUser 
} = require("../../controllers/admin_old/userController/getAlluser");

const { 
    adminAuthenticate 
} = require("../../controllers/admin_old/auth/adminAuthenticate");

const { 
    getOneUser 
} = require("../../controllers/admin_old/userController/getOneUser");

const router = express.Router();

router.get("/list", adminAuthenticate, getAllUser);
router.get("/list/:userId", adminAuthenticate, getOneUser);

module.exports = router;
