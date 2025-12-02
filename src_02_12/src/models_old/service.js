const mongoose = require("mongoose");

const serviceSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  //-------------------------------------------
  // add one more thing for image in service
  //-------------------------------------------

  image: {
    type: String,
  },

  status: {
    type: String,
    enum: ["active", "inactive"],
    default: "active",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Service = mongoose.model("Service", serviceSchema);
module.exports = Service;
