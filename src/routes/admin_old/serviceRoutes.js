const express = require("express");
const router = express.Router();

const fileUploader = require("../../middlewares/fileUploader");
const {
  adminAuthenticate,
} = require("../../controllers/admin/auth/adminAuthenticate");
const {
  createService,
} = require("../../controllers/admin/serviceController/createService");
const {
  allServices,
} = require("../../controllers/admin/serviceController/allServices");
const {
  deleteService,
} = require("../../controllers/admin/serviceController/deleteService");
const {
  detailService,
} = require("../../controllers/admin/serviceController/detailService");
const {
  getDataById,
} = require("../../controllers/admin/serviceController/getDataById");
const {
  updateService,
} = require("../../controllers/admin/serviceController/updateService");

router.get("/get", adminAuthenticate, allServices);
router.post(
  "/create",
  fileUploader("service", [{ name: "image", maxCount: 1 }]),
  adminAuthenticate,
  createService
);
router.get("/getDataById/:id", adminAuthenticate, getDataById);
router.patch(
  "/update/:id",
  fileUploader("service", [{ name: "image", maxCount: 1 }]),
  adminAuthenticate,
  updateService
);
router.delete("/delete/:id", adminAuthenticate, deleteService);

module.exports = router;
