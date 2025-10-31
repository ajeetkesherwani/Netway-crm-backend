const express = require("express");

const authRoutes = require("./driver/authRoutes");
const orderRoutes = require("./driver/orderRoutes");

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/order", orderRoutes);


module.exports = router; 