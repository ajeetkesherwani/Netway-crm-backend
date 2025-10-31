const express = require("express");
const router = express.Router();
const {
  vendorAuthenticate,
} = require("../../controllers/vendor/authController/vendorAuthenticate");
const {
  getList,
} = require("../../controllers/vendor/commonController/getList");
const {
  getServiceList,
} = require("../../controllers/vendor/commonController/getServiceList");

router.get("/list/:type", vendorAuthenticate, getList);
router.get("/getServiceList", getServiceList);

module.exports = router;
