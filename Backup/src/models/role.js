const mongoose = require("mongoose");
const { Schema } = mongoose;

const nestedPermissionsSchema = new Schema(
  {
    // Each module (like 'users', 'packages', etc.)
    // will be a key whose value is a map of actions
    // like { view: true, edit: false, ban: true }
  },
  { strict: false, _id: false } // Allow dynamic keys at all levels
);

const roleSchema = new Schema(
  {
    roleName: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    permissions: {
      type: Map,
      of: new Schema({}, { strict: false, _id: false }) // Dynamic keys inside modules
    },
    addedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User', 
    },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Role", roleSchema);
