const express = require('express');
const router = express.Router();
const { adminAuthenticate } = require('../../controllers/admin/auth/adminAuthenticate');
const { authorize } = require("../../middlewares/authorize");
const {
    createRole,
    getRoles,
    getRoleById,
    updateRole,
    deleteRole,
    toggleRoleStatus
} = require('../../controllers/admin/Role/roleController');

const {
    updateRolePermissions
} = require('../../controllers/admin/Role/updatePermission');

// Create new role
router.post('/create', adminAuthenticate, createRole);

// Get all roles
router.get('/list', adminAuthenticate, authorize("users", "listing"), getRoles);

// Get single role by ID
router.get('/:id', adminAuthenticate, getRoleById);

// Update role
router.patch('/update/:id', adminAuthenticate, updateRole);

// Delete role
router.delete('/delete/:id', adminAuthenticate, deleteRole);

// Toggle role status
router.patch('/toggle-status/:id', adminAuthenticate, toggleRoleStatus);

//update permission
router.patch("/permission/:id", adminAuthenticate, updateRolePermissions);

module.exports = router;