const express = require("express");

const router = express.Router();
const {
  userAuthenticate,
} = require("../controllers/user/authController/userAuthenticate");

const {
  getHomeData,
} = require("../controllers/user/homeController/getHomeData");
router.get("/test", (req, res) => {
  res.status(200).json({ message: "this is user test route" });
});
const { getPlanHistoryByUserId } = require("../controllers/user/homeController/getUserPlanHistory");
const { getPackageDetails } = require("../controllers/user/homeController/getPackageDetails");


//=================== UnAuthenticated End Points ===================================//
router.get("/home",userAuthenticate, getHomeData);
router.get("/planHistory", userAuthenticate, getPlanHistoryByUserId);
router.use("/auth", require("./user/authRoutes"));
router.use("/recharge", require("./user/rechargeRoutes"));
router.use("/connectionRequest", require("./user/connectionRequestRoutes"));
router.use("/message", require("./user/messageRoutes"));
router.use("/cms", require("./user/cmsRoutes"));
module.exports = router;
