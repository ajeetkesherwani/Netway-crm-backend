const mongoose = require("mongoose");

const fabricSchema = new mongoose.Schema({
  fabricName: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.model("Fabric", fabricSchema);
