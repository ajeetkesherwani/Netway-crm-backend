const express = require("express");

const {
  userAuthenticate, 
    
} = require("../../controllers/user/authController/userAuthenticate");

const {
    createUserDueAmountPayment
} = require("../../controllers/user/userDueAmount/createDueAmount");    

const {
    getPaidDueAmountHistory
} = require("../../controllers/user/userDueAmount/getPaidAmountHistory");

const {
    getPaymentHistoryPdf
} = require("../../controllers/user/userDueAmount/getHistoryPdf");

const router = express.Router();

router.post("/create", userAuthenticate, createUserDueAmountPayment);
router.get("/history/list", userAuthenticate, getPaidDueAmountHistory);
router.get("/history/pdf", userAuthenticate, getPaymentHistoryPdf);

module.exports = router;