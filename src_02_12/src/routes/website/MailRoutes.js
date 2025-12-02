const express = require("express");

const {
    sendNewConnection
} = require("../../controllers/webiste/mailController/sendNewConnection");

const router = express.Router();
router.post("/sendNewConnection", sendNewConnection);

module.exports = router;