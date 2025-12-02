const express = require("express");

const { 
    getOrderList 
} = require("../../controllers/vendor/homeController/subOrderList");

const { 
    updateSubOrderListStatus 
} = require("../../controllers/vendor/homeController/updateSubOrderListStatus");

const { 
    assignDeliveryBoyTosubOrder 
} = require("../../controllers/vendor/homeController/assignDeliveryBoyTosubOrder");

const { 
    verifysubOrderOtp 
} = require("../../controllers/vendor/homeController/verifysubOrderOtp");

const { 
    getOrderListDetails 
} = require("../../controllers/vendor/homeController/subOrderListDetails");

const { 
    getDriver 
} = require("../../controllers/vendor/homeController/getDriver");


const router = express.Router();

router.get("/driver", getDriver);
router.get("/list", getOrderList);
router.get("/list/details", getOrderListDetails);
router.patch("/suborder/:subOrderId/assignDriver", assignDeliveryBoyTosubOrder);
router.post("/suborder/:subOrderId/verify-otp", verifysubOrderOtp);
router.patch("/suborder/:subOrderId", updateSubOrderListStatus);

module.exports = router;
