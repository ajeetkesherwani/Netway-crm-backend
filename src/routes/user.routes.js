const express = require("express");

const router = express.Router();

// const { getProfile } = require("../controllers/user/authController/getProfile");
// const updateProfile = require("../controllers/user/authController/updateProfile");
// const fileUploader = require("../middlewares/fileUploader");
const {
  userAuthenticate,
} = require("../controllers/user/authController/userAuthenticate");

// const {
//   getAllServices,
// } = require("../controllers/user/homeController/getAllServices");

const {
  getHomeData,
} = require("../controllers/user/homeController/getHomeData");
// const {
//   getServiceCategory,
// } = require("../controllers/user/homeController/getServiceCategory");
router.get("/test", (req, res) => {
  res.status(200).json({ message: "this is user test route" });
});
const { getPlanHistoryByUserId } = require("../controllers/user/homeController/getUserPlanHistory");

//=================== UnAuthenticated End Points ===================================//
router.get("/home",userAuthenticate, getHomeData);
router.get("/planHistory", userAuthenticate, getPlanHistoryByUserId);
// router.get("/get-allServices", getAllServices);
// router.get("/serviceCategory/list/:serviceId", getServiceCategory);

// //=================== Authenticated End Points ===================================//

// //=================== Profile End Points ===================================//
// router.get("/profile", userAuthenticate, getProfile);
// router.patch(
//   "/profile",
//   userAuthenticate,
//   fileUploader("user", [{ name: "profileImage", maxCount: 1 }]),
//   updateProfile
// );

router.use("/auth", require("./user/authRoutes"));
router.use("/recharge", require("./user/rechargeRoutes"));
router.use("/connectionRequest", require("./user/connectionRequestRoutes"));
router.use("/message", require("./user/messageRoutes"));
router.use("/cms", require("./user/cmsRoutes"));
// router.use("/shop", require("./user/shopRoutes"));
// router.use("/userAddress", require("./user/userAddressRoutes"));
// router.use("/ratingReview", require("./user/reviewRoutes"));
// router.use("/wishlist", require("./user/wishlistRoutes"));
// router.use("/addToCart", require("./user/addToCartRoutes"));
// router.use("/checkout", require("./user/checkoutRoutes"));
// router.use("/order", require("./user/orderRoutes"));
// router.use("/cmsData", require("./user/cmsRoutes"));
// router.use("/filter", require("./user/filterRoutes"));
module.exports = router;
