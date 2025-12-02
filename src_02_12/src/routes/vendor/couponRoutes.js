const express = require("express");

const { 
    createCoupon 
} = require("../../controllers/vendor/couponController/createCoupon");

const { 
    getAllCoupons 
} = require("../../controllers/vendor/couponController/getAllCoupon");

const { 
    updateCoupon 
} = require("../../controllers/vendor/couponController/updateCoupon");

const { 
    deleteCoupon 
} = require("../../controllers/vendor/couponController/deleteCoupon");

const { 
    vendorAuthenticate 
} = require("../../controllers/vendor/authController/vendorAuthenticate");


const router = express.Router();

router.post("/create", vendorAuthenticate, createCoupon);
router.get("/list", vendorAuthenticate, getAllCoupons);
router.patch("/update/:id", vendorAuthenticate, updateCoupon);
router.delete("/delete/:id", vendorAuthenticate, deleteCoupon);

module.exports = router;
