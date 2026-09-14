const express = require("express");
const { adminAuthenticate } = require("../../controllers/admin/auth/adminAuthenticate");
const {
  createCategory,
  getCategories,
  updateCategory,
  deleteCategory
} = require("../../controllers/admin/expensesCategory/expensesCategory");

const router = express.Router();

router.use(adminAuthenticate);

router.post("/create", createCategory);
router.get("/list", getCategories);
router.patch("/update/:id", updateCategory);
router.delete("/delete/:id", deleteCategory);

module.exports = router;
