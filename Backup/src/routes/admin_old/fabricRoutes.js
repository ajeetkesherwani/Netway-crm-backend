const express = require("express");
const router = express.Router();

const fileUploader = require("../../middlewares/fileUploader");
const {
  adminAuthenticate,
} = require("../../controllers/admin/auth/adminAuthenticate");
const {
  createFabric,
} = require("../../controllers/admin/fabricController/createFabric");
const {
  getAllFabric,
} = require("../../controllers/admin/fabricController/getFabric");
const {
  fabricDetail,
} = require("../../controllers/admin/fabricController/fabricDetails");
const {
  deleteFabric,
} = require("../../controllers/admin/fabricController/deleteFabric");
const {
  updateFabric,
} = require("../../controllers/admin/fabricController/updateFabric");

router.get("/list", adminAuthenticate, getAllFabric);
router.post("/create", adminAuthenticate, createFabric);
router.patch("/update/:id", adminAuthenticate, updateFabric);
router.get("/details/:id", adminAuthenticate, fabricDetail);
router.delete("/delete/:id", adminAuthenticate, deleteFabric);

module.exports = router;
