const express = require("express");
const router = express.Router();

// Route modules
router.use("/auth", require("./admin/authRoutes"));
router.use("/package", require("./admin/packageRoutes"));
router.use("/role", require("./admin/roleRoutes"));
router.use("/user", require("./admin/userRoutes"));
router.use("/webUser", require("./admin/webUserRoutes"));
router.use("/payment", require("./admin/paymentRoutes"));







// router.use("/category", require("./admin/categoryRoutes"));
// router.use("/fabric", require("./admin/fabricRoutes"));
// router.use("/product", require("./admin/productRoutes"));
// router.use("/varient", require("./admin/variantRoutes"));
// router.use("/vendor", require("./admin/vendorRoutes"));
// router.use("/service", require("./admin/serviceRoutes"));
// router.use("/dealsOfTheDay", require("./admin/dealsRoutes"));
// router.use("/productVarient", require("./admin/productVariantRoutes"));
// router.use("/newsLetter", require("./admin/newsLetterRoutes"));
// router.use("/cmsPage", require("./admin/cmsPageRoutes"));
// router.use("/setting", require("./admin/settingRoutes"));
// router.use("/common", require("./admin/commonRoutes"));
// router.use("/productInventory", require("./admin/inventoryRoutes"));
// router.use("/user", require("./admin/userRoutes"));
// router.use("/mainOrder", require("./admin/orderRoutes"));
// router.use("/driver", require("./admin/driverRoutes"));
// router.use("/wallet", require("./admin/walletRoutes"));

// router.use("/role", require("./admin/roleRoutes"));
// router.use("/members", require("./admin/adminUserRoutes"));
// router.use("/dashboard", require("./admin/adminDashBoardRoutes"));
// router.use("/settleWallet", require("./admin/settleWalletRoutes"));

module.exports = router;
