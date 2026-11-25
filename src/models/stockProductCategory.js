const mongoose = require("mongoose");

const stockProductCategorySchema = new mongoose.Schema(
  {
    productName: {
        type: String,
        required: [true, "Product Name is required"],
    },
    vendor: {
        type: String,
        required: [true, "Vendor is required"],
    },
},  { timestamps: true }
);

const StockProductCategory = mongoose.model("StockProductCategory", stockProductCategorySchema);
module.exports = StockProductCategory;


