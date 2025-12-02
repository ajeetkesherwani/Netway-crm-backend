const express = require("express");

const { 
    createInventory 
} = require("../../controllers/admin/productInventroyController/createInventory");

const { 
    getInventory 
} = require("../../controllers/admin/productInventroyController/getInventory");

const { 
    updateInventory 
} = require("../../controllers/admin/productInventroyController/updateInventory");

const { 
    adminAuthenticate 
} = require("../../controllers/admin/auth/adminAuthenticate");
const { getOneInventory } = require("../../controllers/admin/productInventroyController/getInventoryDetail");

const router = express.Router();

router.post("/create", adminAuthenticate, createInventory);
router.get("/list", adminAuthenticate, getInventory);
router.get("/list/:id", adminAuthenticate, getOneInventory);
router.patch("/update/:id", adminAuthenticate, updateInventory);

module.exports = router;


