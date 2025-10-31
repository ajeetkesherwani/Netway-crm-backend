const express = require("express");
const {
  userAuthenticate,
} = require("../../controllers/user/authController/userAuthenticate");
const {
  createOrderRatingReview,
} = require("../../controllers/user/ratingReviewController/orderRatingReview");
const {
  createdriverRatingReview,
} = require("../../controllers/user/ratingReviewController/driverRatingReview");
const {
  createVendorRatingReview,
} = require("../../controllers/user/ratingReviewController/vendorRatingReview");

const router = express.Router();

router.post("/order/create", userAuthenticate, createOrderRatingReview);
router.post("/driver/create", userAuthenticate, createdriverRatingReview);
router.post("/vendor/create", userAuthenticate, createVendorRatingReview);

module.exports = router;
