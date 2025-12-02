const express = require("express");
const router = express.Router();

const {
  adminAuthenticate,
} = require("../../controllers/admin/auth/adminAuthenticate");
const {
  getAllRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
} = require("../../controllers/admin/roleController");

// Get all roles
router.get("/list", adminAuthenticate, getAllRoles);

// Create a new role
router.post("/create", adminAuthenticate, createRole);

// Get role by ID
router.get("/getDataById/:id", adminAuthenticate, getRoleById);

// Update role by ID
router.patch("/update/:id", adminAuthenticate, updateRole);

// Delete role by ID
router.delete("/delete/:id", adminAuthenticate, deleteRole);

module.exports = router;
