const express = require("express");
const {
  userAuthenticate,
} = require("../../controllers/user/authController/userAuthenticate");
const { getList } = require("../../controllers/user/cmsController/getList");
const router = express.Router();

router.get("/list", userAuthenticate, getList);

module.exports = router;
