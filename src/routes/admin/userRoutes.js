const express = require("express");
const router = express.Router();
const {
  adminAuthenticate,
} = require("../../controllers/admin/auth/adminAuthenticate");

const fileUploader = require("../../middlewares/fileUploader");
const { createUser } = require("../../controllers/admin/user/CreateUser");

const { getUserList } = require("../../controllers/admin/user/getUser");

const {
  getUserDetails,
} = require("../../controllers/admin/user/getUserDetails");

const { updateUser } = require("../../controllers/admin/user/updateUser");

const { deleteUser } = require("../../controllers/admin/user/deleteUser");

const {
  getUserFullDetails,
} = require("../../controllers/admin/user/userProfileDetails");

const {
  getPurchasedPlanList,
} = require("../../controllers/admin/user/purchedPlanList");

const {
  getCurrentPlan,
} = require("../../controllers/admin/useData/getUserCurrentPlan");

const {
  toggleAutoRecharge,
} = require("../../controllers/admin/user/autoRecharge");

// router.post('/create', adminAuthenticate, fileUpload.array("documents", 10), createUser);
router.post(
  "/create",
  adminAuthenticate,
  fileUploader("user_documents", [{ name: "documents", maxCount: 15 }]),
  createUser
);

router.get("/list", adminAuthenticate, getUserList);
router.get("/:id", adminAuthenticate, getUserDetails);
router.get("/fullDetails/:userId", adminAuthenticate, getUserFullDetails);
router.patch(
  "/update/:userId",
  adminAuthenticate,
  fileUploader("user_documents", [{ name: "documents", maxCount: 10 }]),
  updateUser
);
router.delete("/delete/:userId", adminAuthenticate, deleteUser);
router.get("/currentPlan/:userId", adminAuthenticate, getCurrentPlan);
router.get("/purchedPlan/list/:userId", adminAuthenticate, getPurchasedPlanList);
router.patch("/auto-recharge/:userId", adminAuthenticate, toggleAutoRecharge);

module.exports = router;
