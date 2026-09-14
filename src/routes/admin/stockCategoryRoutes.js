const express = require("express");
const fileUploader = require("../../middlewares/fileUploader");

const {
  adminAuthenticate,
} = require("../../controllers/admin/auth/adminAuthenticate");

const {
  createStockCategory,
} = require("../../controllers/admin/stockCategory/createStockCategory");
const {
  updateStockCategory,
} = require("../../controllers/admin/stockCategory/updateStockCategory");
const {
  deleteStockCategory,
} = require("../../controllers/admin/stockCategory/deleteStockCategory");
const {
  getStockCategories,
} = require("../../controllers/admin/stockCategory/getStockCategories");
const {
  bulkUploadStockCategory,
} = require("../../controllers/admin/stockCategory/bulkUploadStockCategory");
const {
  assignToEngineer,
  assignToUser,
  reassignToEngineer,
  reassignToUser,
} = require("../../controllers/admin/stockCategory/assignStockCategory");

const router = express.Router();

router.use(adminAuthenticate);

router.post("/create", createStockCategory);
router.patch("/update/:id", updateStockCategory);
router.delete("/delete/:id", deleteStockCategory);
router.get("/list", getStockCategories);
router.post(
  "/bulk-upload",
  fileUploader("bulkUploads", [{ name: "file", maxCount: 1 }]),
  bulkUploadStockCategory
);
router.post("/assign/engineer/:id", assignToEngineer);
router.post("/assign/user/:id", assignToUser);
router.post("/reassign/engineer/:id", reassignToEngineer);
router.post("/reassign/user/:id", reassignToUser);

module.exports = router;
