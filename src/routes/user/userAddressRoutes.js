const express = require("express");
const router = express.Router();

const {
  userAuthenticate,
} = require("../../controllers/user/authController/userAuthenticate");

const {
  getAddressList,
} = require("../../controllers/user/userAddressController/getAddressList");
const {
  createAddress,
} = require("../../controllers/user/userAddressController/createAddress");
const {
  updateAddress,
} = require("../../controllers/user/userAddressController/updateAddress");
const {
  deleteAddress,
} = require("../../controllers/user/userAddressController/deleteAddress");

router.get("/list", userAuthenticate, getAddressList);
router.post("/createAddress", userAuthenticate, createAddress);
router.patch("/updateAddress/:id", userAuthenticate, updateAddress);
router.delete("/deleteAddress/:id", userAuthenticate, deleteAddress);
module.exports = router;
