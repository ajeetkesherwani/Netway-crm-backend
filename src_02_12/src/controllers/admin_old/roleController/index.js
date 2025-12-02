// Import the responseHandler utility
const {
  successResponse,
  errorResponse,
} = require("../../../utils/responseHandler");
const Role = require("../../../models_old/role"); // Assuming Role model is in models/roleModel.js
const paginate = require("../../../utils/paginate");

// Get all roles
// exports.getAllRoles = async (req, res) => {
//   try {
//     const roles = await Role.find();
//     successResponse(res, "Roles fetched successfully", roles);
//   } catch (err) {
//     errorResponse(res, "Error fetching roles", 500, err.message);
//   }
// };

exports.getAllRoles = async (req, res) => {
  try {
    const { page, limit } = req.query;

    const result = await paginate(Role, {}, { page, limit });

    successResponse(res, "Roles fetched successfully", result);
  } catch (err) {
    errorResponse(res, "Error fetching roles", 500, err.message);
  }
};


// Get role by ID
exports.getRoleById = async (req, res) => {
  const { id } = req.params;
  try {
    const role = await Role.findById(id);
    if (!role) {
      return errorResponse(res, "Role not found", 404);
    }
    successResponse(res, "Role fetched successfully", role);
  } catch (err) {
    errorResponse(res, "Error fetching the role", 500, err.message);
  }
};

// Create a new role
exports.createRole = async (req, res) => {
  const { name, description, permissions, isActive } = req.body;
  try {
    // Check if a role with the same name already exists
    const existingRole = await Role.findOne({ name });
    if (existingRole) {
      return errorResponse(res, "Role with this name already exists", 400);
    }

    // Create a new Role instance using the data
    const newRole = new Role({
      name,
      description,
      permissions, // Permissions are now passed directly as an object
      isActive: isActive !== undefined ? isActive : true,
    });

    await newRole.save();
    successResponse(res, "Role created successfully", newRole, 201);
  } catch (err) {
    errorResponse(res, "Error creating role", 500, err.message);
  }
};

// Update an existing role
exports.updateRole = async (req, res) => {
  const { id } = req.params;
  const { name, description, permissions, isActive } = req.body;
  try {
    const updatedRole = await Role.findByIdAndUpdate(
      id,
      { name, description, permissions, isActive },
      { new: true } // Return the updated role in the response
    );

    if (!updatedRole) {
      return errorResponse(res, "Role not found", 404);
    }

    successResponse(res, "Role updated successfully", updatedRole);
  } catch (err) {
    errorResponse(res, "Error updating role", 500, err.message);
  }
};

// Delete a role
exports.deleteRole = async (req, res) => {
  const { id } = req.params;
  try {
    const deletedRole = await Role.findByIdAndDelete(id);
    if (!deletedRole) {
      return errorResponse(res, "Role not found", 404);
    }
    successResponse(res, "Role deleted successfully");
  } catch (err) {
    errorResponse(res, "Error deleting role", 500, err.message);
  }
};
