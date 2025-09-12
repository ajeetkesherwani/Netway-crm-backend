const express = require("express");
const router = express.Router();

const {
  adminAuthenticate,
} = require("../../controllers/admin/auth/adminAuthenticate");

const {
  createUser,
} = require("../../controllers/admin/adminUserController/createUser");
const {
  updateUser,
} = require("../../controllers/admin/adminUserController/updateUser");
const {
  getDataById,
} = require("../../controllers/admin/adminUserController/getDataById");
const {
  getAllUserList,
} = require("../../controllers/admin/adminUserController/getAllUserList");
const {
  deleteUser,
} = require("../../controllers/admin/adminUserController/deleteUser");

//Auth
router.post("/createUser", adminAuthenticate, createUser);
router.patch("/updateUser/:id", adminAuthenticate, updateUser);
router.get("/getUser/:id", adminAuthenticate, getDataById);
router.get("/getAllUsers", adminAuthenticate, getAllUserList);
router.delete("/deleteUser/:id", adminAuthenticate, deleteUser);
module.exports = router;
