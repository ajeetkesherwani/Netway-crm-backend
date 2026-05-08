const express = require("express");

const {
    adminAuthenticate
} = require("../../controllers/admin/auth/adminAuthenticate");

const {
    getAllServer,
    getServerById,
    updateServer,
    deleteServer,
    createServer
} = require("../../controllers/admin/Server/server"); 



const router = express.Router();

router.get("/get", adminAuthenticate, getAllServer);
router.post("/create", adminAuthenticate, createServer);
router.get("/view/:id", adminAuthenticate, getServerById);
router.patch("/update/:id", adminAuthenticate, updateServer);
router.delete("/delete/:id", adminAuthenticate, deleteServer);

module.exports = router;