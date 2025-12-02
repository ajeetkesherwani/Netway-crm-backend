const express = require("express");
const fileUploader = require("../../middlewares/fileUploader");
const validatePlaceOrder = require("../../helper/validator/validatePlaceOrder");
const {
  userAuthenticate,
} = require("../../controllers/user/authController/userAuthenticate");
const {
  getOrderList,
} = require("../../controllers/user/orderController/getOrderList");
const {
  getOrderDetails,
} = require("../../controllers/user/orderController/getOrderDetails");
const {
  createOrder,
} = require("../../controllers/user/orderController/createOrder");
const {
  createOrderReturnRequest,
} = require("../../controllers/user/orderController/createOrderReturnRequest");

const validateResponse = require("../../middlewares/validateResponse");

const { 
  createExchangeRequests 
} = require("../../controllers/user/orderController/createExchangeRequest");

const router = express.Router();

router.get("/list", userAuthenticate, getOrderList);
router.get("/details/:id", userAuthenticate, getOrderDetails);
router.post(
  "/create",
  userAuthenticate,
  validatePlaceOrder,
  validateResponse,
  createOrder
);
router.post(
  "/createReturnRequet",
  userAuthenticate,
  fileUploader("orderReturn", [{ name: "uploadFiles", maxCount: 5 }]),
  createOrderReturnRequest
);

router.post("/createExchangeRequest", userAuthenticate,
   fileUploader("exchangeOrder", [{ name: "uploadFiles", maxCount: 5 }]),
   createExchangeRequests);

module.exports = router;
