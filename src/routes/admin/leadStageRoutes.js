const express = require("express");
const {
  adminAuthenticate,
} = require("../../controllers/admin/auth/adminAuthenticate");
const {
  createLeadStage,
  getLeadStages,
  getLeadStage,
  updateLeadStage,
  deleteLeadStage,
} = require("../../controllers/admin/leadStage/leadStageController");

const router = express.Router();

router.use(adminAuthenticate);
router.post("/create", createLeadStage);
router.get("/list", getLeadStages);
router.get("/:id", getLeadStage);
router.patch("/update/:id", updateLeadStage);
router.delete("/delete/:id", deleteLeadStage);

module.exports = router;
