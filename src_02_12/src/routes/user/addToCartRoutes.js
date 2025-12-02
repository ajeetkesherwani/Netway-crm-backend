const express = require("express");
const {
  userAuthenticate,
} = require("../../controllers/user/authController/userAuthenticate");
const {
  createAddtocart,
} = require("../../controllers/user/addToCartController/createAddtocart");
const {
  getAddTOCart,
} = require("../../controllers/user/addToCartController/getAddToCart");
const {
  deleteAddTOCart,
} = require("../../controllers/user/addToCartController/deleteAddToCart");
const router = express.Router();

router.post("/create", userAuthenticate, createAddtocart);
router.get("/list", userAuthenticate, getAddTOCart);
router.delete("/delete/:id", userAuthenticate, deleteAddTOCart);
module.exports = router;
