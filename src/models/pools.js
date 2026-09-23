const mongoose = require("mongoose");

const PoolSchema =  new mongoose.Schema({

    poolName: { type: String, required: true },
    zone: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Zone",
        required: true
    },

}, {
    timestamps: true
});

module.exports = mongoose.model("Pool", PoolSchema);