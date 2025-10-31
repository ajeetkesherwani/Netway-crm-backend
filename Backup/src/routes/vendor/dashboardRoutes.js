const express = require("express");
const { 
    vendorAuthenticate 
} = require("../../controllers/vendor/authController/vendorAuthenticate");

const { 
    getHomeData 
} = require("../../controllers/vendor/homeDashboardController/homeData");

const { 
    getDataDetails 
} = require("../../controllers/vendor/homeDashboardController/homeDataDetails");


const router = express.Router();

router.get("/list/data", vendorAuthenticate, getHomeData);
router.get("/list/details", vendorAuthenticate, getDataDetails);

module.exports = router;