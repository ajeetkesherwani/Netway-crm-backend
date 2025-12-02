const Role = require('../../../models/role');
const catchAsync = require('../../../utils/catchAsync');
const AppError = require('../../../utils/AppError');
const { successResponse } = require('../../../utils/responseHandler');

// Create Role
exports.createRole = catchAsync(async (req, res, next) => {
    const { roleName, description, permissions, addedBy } = req.body;

    if (!roleName || !permissions) {
        return next(new AppError('Name and permissions are required', 400));
    }

    const existingRole = await Role.findOne({ roleName });
    if (existingRole) {
        return next(new AppError('Role with this name already exists', 409));
    }

    const role = await Role.create({
        roleName,
        // description,
        permissions,
        addedBy
    });
    console.log(role, "role");

    successResponse(res, 'Role created successfully', role);
});

// Get All Roles
exports.getRoles = catchAsync(async (req, res) => {
    const roles = await Role.find()
        .populate('addedBy', 'name email')
        .sort('-createdAt');

    successResponse(res, 'Roles fetched successfully', roles);
});

// Get Role by ID
exports.getRoleById = catchAsync(async (req, res, next) => {
    const role = await Role.findById(req.params.id)
        .populate('addedBy', 'name email');

    if (!role) {
        return next(new AppError('Role not found', 404));
    }

    successResponse(res, 'Role fetched successfully', role);
});

// Update Role
exports.updateRole = catchAsync(async (req, res, next) => {
    const { name, description, permissions } = req.body;

    const role = await Role.findById(req.params.id);
    if (!role) {
        return next(new AppError('Role not found', 404));
    }

    // Check if new name already exists (excluding current role)
    if (name && name !== role.name) {
        const existingRole = await Role.findOne({ name });
        if (existingRole) {
            return next(new AppError('Role with this name already exists', 409));
        }
    }

    const updatedRole = await Role.findByIdAndUpdate(
        req.params.id,
        { name, description, permissions },
        { new: true, runValidators: true }
    );

    successResponse(res, 'Role updated successfully', updatedRole);
});

// Delete Role
exports.deleteRole = catchAsync(async (req, res, next) => {
    const role = await Role.findByIdAndDelete(req.params.id);

    if (!role) {
        return next(new AppError('Role not found', 404));
    }

    successResponse(res, 'Role deleted successfully', null);
});

// Toggle Role Status
exports.toggleRoleStatus = catchAsync(async (req, res, next) => {
    const role = await Role.findById(req.params.id);

    if (!role) {
        return next(new AppError('Role not found', 404));
    }

    role.isActive = !role.isActive;
    await role.save();

    successResponse(res, `Role ${role.isActive ? 'activated' : 'deactivated'} successfully`, role);
});