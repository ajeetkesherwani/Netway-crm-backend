const mongoose = require("mongoose");

const roleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true, // Name of the role, required field
      unique: true, // Make sure role names are unique
      trim: true, // Trim any unnecessary spaces around the name
    },
    description: {
      type: String,
      required: true, // Description of the role, required field
      trim: true, // Trim any unnecessary spaces around the description
    },
    permissions: {
      type: [
        {
          // The module name like 'User', 'Category', etc.
          module: { type: String, required: true },
          // Permissions for the module like create, edit, delete, list
          permissions: {
            create: { type: String, enum: ["true", "false"], default: "false" },
            edit: { type: String, enum: ["true", "false"], default: "false" },
            delete: { type: String, enum: ["true", "false"], default: "false" },
            list: { type: String, enum: ["true", "false"], default: "false" },
            view: { type: String, enum: ["true", "false"], default: "false" },
          },
        },
      ],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true, // Role is active by default
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

// Create the Role model using the schema
const Role = mongoose.model("Role", roleSchema);

module.exports = Role;
