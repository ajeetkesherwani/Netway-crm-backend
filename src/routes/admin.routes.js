const express = require("express");
const router = express.Router();

// Route modules
router.use("/auth", require("./admin/authRoutes"));
router.use("/package", require("./admin/packageRoutes"));
router.use("/role", require("./admin/roleRoutes"));
router.use("/user", require("./admin/userRoutes"));
router.use("/webUser", require("./admin/webUserRoutes"));
router.use("/payment", require("./admin/paymentRoutes"));
router.use("/staff", require("./admin/staffRoutes"));
router.use("/retailer", require("./admin/retialerRoutes"));
router.use("/lco", require("./admin/lcoRoutes"));
router.use("/assignPackage", require("./admin/assignPackageRoutes"));
router.use("/ticket", require("./admin/ticketRoutes"));
router.use("/priceBook", require("./admin/priceBookRoutes"));
router.use("/resellerWallet", require("./admin/resellerWalletRoutes"));
router.use("/lcoWallet", require("./admin/lcoWalletRoutes"));
router.use("/ticketAssign", require("./admin/ticketAssignRoutes"));
router.use("/zone", require("./admin/ZoneRoutes"));
router.use("/category", require("./admin/categoryRoutes"));
router.use("/common", require("./admin/commonRoutes"));
router.use("/ticketReply", require("./admin/ticketReplyRoutes"));
router.use("/timeLine", require("./admin/timeLineRoutes"));
router.use("/resellerConfig", require("./admin/resellerConfigRoutes"));

router.use("/purchasedPlan", require("./admin/purchasedPlanRoutes"));
router.use("/subscriberReport", require("./admin/subscriberReportRoutes"));
router.use("/franchiseeReport", require("./admin/franchiseeReportRoutes"));
router.use("/misReport", require("./admin/misReportRoutes"));
router.use("/revenueReport", require("./admin/revenueReportRoutes"));
router.use("/userManage", require("./admin/userManageRoutes"));
router.use("/dashboard", require("./admin/dashboardRoutes"));
router.use("/hardware", require("./admin/hardwareRoutes"));
router.use("/ticketReport", require("./admin/ticketReportRoutes"));
router.use("/resellerWise", require("./admin/resllerWiseDashboardRoutes"));
router.use("/lcoWise", require("./admin/lcoWiseDashboardRoutes"));
router.use("/ticketReplyOption", require("./admin/ticketReplyOptionRoutes"));


module.exports = router;
