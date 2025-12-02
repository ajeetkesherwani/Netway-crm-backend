const express = require("express");
const {
  userAuthenticate,
} = require("../../controllers/user/authController/userAuthenticate");
const {
  getAllCategory,
} = require("../../controllers/user/filterController/getAllCategory");
const {
  getSubCategory,
} = require("../../controllers/user/filterController/getSubCategory");
const {
  getFilterTypeValues,
} = require("../../controllers/user/filterController/getFilterTypeValues");
const {
  getFilterData,
} = require("../../controllers/user/filterController/getFilterData");
const router = express.Router();

router.get("/getAllCategory/:vendorId", userAuthenticate, getAllCategory);
router.get("/getSubCategory/:categoryId", userAuthenticate, getSubCategory);
router.get("/getFilterTypeValues/:type", userAuthenticate, getFilterTypeValues);
router.get("/getFilterData/:vendorId", userAuthenticate, getFilterData);

module.exports = router;
