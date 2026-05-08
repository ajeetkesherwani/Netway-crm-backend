const mongoose = require("mongoose");

const PoolSchema =  new mongoose.Schema({

    poolName: { type: String, required: true },

}, {
    timestamps: true
});

module.exports = mongoose.model("Pool", PoolSchema);