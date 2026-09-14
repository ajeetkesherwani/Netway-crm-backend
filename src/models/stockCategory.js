const mongoose = require("mongoose");

const StockCategorySchema = new mongoose.Schema(
  {
    productName: {
      type: String,
      required: [true, "Product Name is required"],
    },
    vendor: {
      type: String,
      required: [true, "Vendor is required"],
    },
    serialNo: {
      type: String,
      required: [true, "Serial No is required"],
    },
    macAddress: {
      type: String,
    },
    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      default: 0,
    },
    stockAlertQuantity: {
      type: Number,
      default: 0,
    },
    description: {
      type: String,
    },
    assignedToEngineer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Staff",
      default: null,
    },
    assignedToUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    assignComment: {
      type: String,
      default: "",
    },
    assignDate: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ["In Stock", "Assigned to Engineer", "Assigned to User"],
      default: "In Stock",
    },
  },
  { timestamps: true }
);

const StockCategory = mongoose.model("StockCategory", StockCategorySchema);

module.exports = StockCategory;
