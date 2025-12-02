const express = require("express");

const {
  adminAuthenticate,
} = require("../../controllers/admin/auth/adminAuthenticate");
const { getList } = require("../../controllers/admin/commonController/getList");
const { vendorProduct } = require("../../controllers/admin/commonController/vendorProduct");

const router = express.Router();

router.get("/list/:type", adminAuthenticate, getList);
router.get("/vendorProduct/:vendor", adminAuthenticate, vendorProduct);

module.exports = router;
