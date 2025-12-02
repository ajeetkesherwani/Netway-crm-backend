const express = require("express");
const {
  userAuthenticate,
} = require("../../controllers/user/authController/userAuthenticate");
const {
  createWishlist,
} = require("../../controllers/user/wishListController/createWishlist");
const {
  getWishlist,
} = require("../../controllers/user/wishListController/getWishlist");
const {
  deleteWishlist,
} = require("../../controllers/user/wishListController/deleteWishlist");
const router = express.Router();

router.post("/create", userAuthenticate, createWishlist);
router.get("/list", userAuthenticate, getWishlist);
router.delete("/delete/:id", userAuthenticate, deleteWishlist);

module.exports = router;
