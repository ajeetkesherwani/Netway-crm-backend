const express = require("express");
const fileUploader = require("../../middlewares/fileUploader");

const {
  sendOtp,
} = require("../../controllers/driver/authController/sentOtp");
const {
  verifyOtp,
} = require("../../controllers/driver/authController/verifyOtp");
const {
  registerDriver,
} = require("../../controllers/driver/authController/registerDriver");

const {
  updateDriverProfile,
} = require("../../controllers/driver/authController/updateProfile");

const router = express.Router();

router.post("/send-otp", sendOtp);
router.post("/verifyOtp", verifyOtp);
router.post("/register",
  fileUploader("driver", [
    { name: "frontPhoto", maxCount: 1 },
    { name: "rcFrontPhoto", maxCount: 1 },
    { name: "rcBackPhoto", maxCount: 1 },
    { name: "licFrontPhoto", maxCount: 1 },
    { name: "licBackPhoto", maxCount: 1 },
    { name: "aadFrontPhoto", maxCount: 1 },
    { name: "aadBackPhoto", maxCount: 1 }
  ]),
  registerDriver);

router.patch("/driver/update/:driverId",
  fileUploader("driver", [
    { name: "frontPhoto", maxCount: 1 },
    { name: "rcFrontPhoto", maxCount: 1 },
    { name: "rcBackPhoto", maxCount: 1 },
    { name: "licFrontPhoto", maxCount: 1 },
    { name: "licBackPhoto", maxCount: 1 },
    { name: "aadFrontPhoto", maxCount: 1 },
    { name: "aadBackPhoto", maxCount: 1 },
  ]), updateDriverProfile);




module.exports = router;