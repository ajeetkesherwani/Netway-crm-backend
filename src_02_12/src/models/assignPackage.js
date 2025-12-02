const mongoose = require("mongoose");

const assignPackageSchema = new mongoose.Schema({
    assignTo: { type: String, enum: ["Reseller", "Lco"], required: true },
    assignToId: { type: mongoose.Schema.Types.ObjectId, required: true, },
    packages: [
        {
            packageId: { type: mongoose.Schema.Types.ObjectId, ref: "Package", required: true },
            name: { type: String },
            basePrice: { type: Number },
            price: { type: Number, required: true },
            retailerPrice: { type: Number },
            offerPrice: { type: Number },
            status: { type: String, enum: ["active", "inActive"], default: "active" }
        }
    ],

    createdBy: {
        type: String,
        enum: ["Admin", "Reseller"],
        required: true,
    },
    createdById: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: "createdBy",
    }

}, { timestamps: true });

assignPackageSchema.index({ assignTo: 1, assignToId: 1 }, { unique: true });

const AssignPackage = mongoose.model("AssignPackage", assignPackageSchema);

module.exports = AssignPackage;
