const express=  require("express");

const {
  userAuthenticate,
} = require("../../controllers/user/authController/userAuthenticate");

const { 
    createMessage
} = require("../../controllers/user/messageController/createMessage");  

const { 
    getSupportMessageList
} = require("../../controllers/user/messageController/getMessageList");
const router = express.Router();

router.post("/create", userAuthenticate, createMessage);
router.get("/list", userAuthenticate, getSupportMessageList);

module.exports = router;