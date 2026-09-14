const mongoose = require("mongoose");

const ExpensesCategorySchema = new mongoose.Schema(
  {
    categoryName: {
      type: String,
      required: true,
      unique: true,
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "addedByModel",
    },
    addedByModel: {
      type: String,
      enum: ["Admin", "Staff", "Retailer", "Lco"],
    },
    addedByName: {
      type: String,
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const ExpensesCategory = mongoose.model("ExpensesCategory", ExpensesCategorySchema);

module.exports = ExpensesCategory;
