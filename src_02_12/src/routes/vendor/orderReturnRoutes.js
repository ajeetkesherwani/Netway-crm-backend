const express = require("express");

const { 
    getOrderReturn 
} = require("../../controllers/vendor/orderReturnController/getOrderReturn");

const router = express.Router();

router.get("/order/:id", getOrderReturn);

module.exports = router;