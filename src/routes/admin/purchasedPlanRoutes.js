const express = require("express");

const {
    adminAuthenticate
} = require("../../controllers/admin/auth/adminAuthenticate");

const {
    createPurchasedPlan
} = require("../../controllers/admin/purchasedPlan/createPurchasedPlan");


const {
    getPurchasedPlanList
} = require("../../controllers/admin/purchasedPlan/getPurchasedPlanList");

const {
    updatePurchasedPlan
} = require("../../controllers/admin/purchasedPlan/updatePurchasedPlan");

const {
    deletePurchasedPlan
} = require("../../controllers/admin/purchasedPlan/deletePurchasedPlan");

const { 
    renewPurchasedPlan 
} = require("../../controllers/admin/purchasedPlan/renewPurchasedPlan.JS");

const { 
    refundPurchasedPlan 
} = require("../../controllers/admin/purchasedPlan/refundPlan");

const router = express.Router();

router.post("/create", adminAuthenticate, createPurchasedPlan);
router.get("/list", adminAuthenticate, getPurchasedPlanList);
router.patch("/update/:id", adminAuthenticate, updatePurchasedPlan);
router.delete("/delete/:id", adminAuthenticate, deletePurchasedPlan);

router.post("/renew/:id", adminAuthenticate, renewPurchasedPlan);
router.post("/refund/:planId", adminAuthenticate, refundPurchasedPlan);

module.exports = router;