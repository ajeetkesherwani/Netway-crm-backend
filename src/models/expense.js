const mongoose = require("mongoose");

const ExpenseSchema = new mongoose.Schema(
  {
    expensesCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ExpensesCategory",
      required: true,
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
    expenseDate: {
      type: Date,
      required: true,
    },
    description: {
      type: String,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentMode: {
      type: String,
      enum: ["Online", "Cash", "Bank", "Check"],
      required: true,
    },
  },
  { timestamps: true }
);

const Expense = mongoose.model("Expense", ExpenseSchema);

module.exports = Expense;
