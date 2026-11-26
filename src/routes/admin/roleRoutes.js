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

const authorizeStaffRolePermission = (action, fallback) => (req, res, next) => {
    const isStaff = req.user?.accountType === "staff" || req.user?.role === "Staff";
    if (!isStaff) {
        return fallback ? fallback(req, res, next) : next();
    }

    return authorize("rolepermission", action)(req, res, next);
};

// Create new role
router.post('/create', adminAuthenticate, authorizeStaffRolePermission("Create"), createRole);

// Get all roles
router.get('/list', adminAuthenticate, authorizeStaffRolePermission("Listing", authorize("users", "Create")), getRoles);

// Get single role by ID
router.get('/:id', adminAuthenticate, authorizeStaffRolePermission("View"), getRoleById);

// Update role
router.patch('/update/:id', adminAuthenticate, authorizeStaffRolePermission("Edit"), updateRole);

// Delete role
router.delete('/delete/:id', adminAuthenticate, authorizeStaffRolePermission("Delete"), deleteRole);

// Toggle role status
router.patch('/toggle-status/:id', adminAuthenticate, authorizeStaffRolePermission("Edit"), toggleRoleStatus);

//update permission
router.patch("/permission/:id", adminAuthenticate, authorizeStaffRolePermission("Edit"), updateRolePermissions);

module.exports = router;