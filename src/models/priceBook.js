const mongoose = require("mongoose");

const priceBookSchema = new mongoose.Schema({
    priceBookName: { type: String, required: true },
    fromDate: { type: Date, required: true },
    toDate: { type: Date, required: true },
    status: { type: String, enum: ["active", "inActive"], default: "inActive" },
    description: { type: String, default: "" },
    priceBookFor: { type: [String], enum: ["Reseller", "Lco"] },
    package: [
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
    assignedTo: [
        {
            type: mongoose.Schema.Types.ObjectId,
        }
    ],
    priceBookForModel: {
        type: String,
        required: true,
        enum: ["Reseller", "Lco"]
    },
    createdBy: { type: String }, // e.g., "Admin", "Reseller"
    createdById: { type: mongoose.Schema.Types.ObjectId, refPath: "createdBy" },
    modifiedBy: { type: String }, // e.g., "Admin", "Reseller"
    modifiedById: { type: mongoose.Schema.Types.ObjectId, refPath: "modifiedBy" }
}, { timestamps: true })

const PriceBook = mongoose.model("PriceBook", priceBookSchema);


module.exports = PriceBook;