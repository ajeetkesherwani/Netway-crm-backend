const express = require("express");
const router = express.Router();

const fileUploader = require("../../middlewares/fileUploader");

const {
  vendorAuthenticate,
} = require("../../controllers/vendor/authController/vendorAuthenticate");

const {
  getOrderList,
} = require("../../controllers/vendor/orderController/getOrderList");

const {
  orderDetail,
} = require("../../controllers/vendor/orderController/orderDetail");

const { 
  getAllSubOrder 
} = require("../../controllers/vendor/orderController/getAllOrderforVendor");
const { getOrderDetailsForVendor } = require("../../controllers/vendor/orderController/getOrderDetailsforVendor");

router.get("/list", vendorAuthenticate, getOrderList);
router.get("/details/:productId", vendorAuthenticate, orderDetail);
router.get("/allOrder/list", vendorAuthenticate, getAllSubOrder);
router.get("/allOrder/:orderId", vendorAuthenticate, getOrderDetailsForVendor);

module.exports = router;
