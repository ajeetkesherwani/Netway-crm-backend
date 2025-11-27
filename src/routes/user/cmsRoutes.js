const express = require("express");

const {
  userAuthenticate,
} = require("../../controllers/user/authController/userAuthenticate");


const {
  createCms,
} = require("../../controllers/user/cmsController/createCms");  

const {
  getCmsList,
} = require("../../controllers/user/cmsController/getCms");



const router = express.Router();

router.post("/create", userAuthenticate, createCms);
router.get("/list", userAuthenticate, getCmsList);



module.exports = router;
