const express = require("express");

const {
    adminAuthenticate
} = require("../../controllers/admin/auth/adminAuthenticate");

const {
    getAllPools,
    createPool,
    getPoolById,
    updatePool,
    deletePool
} = require("../../controllers/admin/Pool/pools");

const router = express.Router();

router.get("/allPool", adminAuthenticate, getAllPools);
router.post("/create", adminAuthenticate, createPool);
router.get("/pool/:id", adminAuthenticate, getPoolById);
router.patch("/update/:id", adminAuthenticate, updatePool);
router.delete("/delete/:id", adminAuthenticate, deletePool);

module.exports = router;