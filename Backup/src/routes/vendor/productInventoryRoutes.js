const express = require("express");
const {
  vendorAuthenticate,
} = require("../../controllers/vendor/authController/vendorAuthenticate");
const {
  createInventory,
} = require("../../controllers/vendor/productInventoryController/createInventory");

const {
  getInventory,
} = require("../../controllers/vendor/productInventoryController/getInventory");

const {
  getOneInventory,
} = require("../../controllers/vendor/productInventoryController/getOneInventory");

const {
  updateInventory,
} = require("../../controllers/vendor/productInventoryController/updateInventory");

const {
  deleteInventory,
} = require("../../controllers/vendor/productInventoryController/deleteInvetory");

const router = express.Router();

router.post("/create", vendorAuthenticate, createInventory);
router.get("/list", vendorAuthenticate, getInventory);
router.get("/list/:id", vendorAuthenticate, getOneInventory);
router.patch("/update/:id", vendorAuthenticate, updateInventory);
router.delete("/delete/:id", vendorAuthenticate, deleteInventory);

module.exports = router;
