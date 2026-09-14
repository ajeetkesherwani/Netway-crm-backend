const express = require("express");
const { adminAuthenticate } = require("../../controllers/admin/auth/adminAuthenticate");
const {
  createExpense,
  getExpenses,
  updateExpense,
  deleteExpense
} = require("../../controllers/admin/expense/expense");

const router = express.Router();

router.use(adminAuthenticate);

router.post("/create", createExpense);
router.get("/list", getExpenses);
router.patch("/update/:id", updateExpense);
router.delete("/delete/:id", deleteExpense);

module.exports = router;
