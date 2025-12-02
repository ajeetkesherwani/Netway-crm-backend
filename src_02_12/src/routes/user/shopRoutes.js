const express = require("express");
const router = express.Router();

const {
  vendorShopList,
} = require("../../controllers/user/shopController/vendorShopList");
const {
  productDetail,
} = require("../../controllers/user/shopController/productDetail");
const {
  searchSuggestion,
} = require("../../controllers/user/shopController/searchSuggestion");

router.get("/vendorDetail/:vendorId", vendorShopList);
router.get("/productDetail/:productId", productDetail);
router.get("/searchSuggestion", searchSuggestion);
module.exports = router;
