const express = require("express");

const fileUploader = require("../../middlewares/fileUploader");
const {
  adminAuthenticate,
} = require("../../controllers/admin/auth/adminAuthenticate");
const {
  createSetting,
} = require("../../controllers/admin/settingController/createSeting");
const {
  getAllSetting,
} = require("../../controllers/admin/settingController/getSetting");
const {
  updateSetting,
} = require("../../controllers/admin/settingController/updateSetting");

const router = express.Router();

router.post(
  "/create",
  fileUploader("setting", [{ name: "logo", maxCount: 1 }]),
  createSetting
);

router.get("/list", adminAuthenticate, getAllSetting);
router.patch(
  "/update/:id",
  fileUploader("setting", [{ name: "logo", maxCount: 1 }]),
  adminAuthenticate,
  updateSetting
);

module.exports = router;
