const express = require('express');
const router = express.Router();
const {
  adminAuthenticate,
} = require("../../controllers/admin/auth/adminAuthenticate");

// const {
//   createUser
// } = require('../../controllers/admin/user/CreateUser');

// const {
//   getUserList
// } = require('../../../controllers/admin/user/getUser');

// const {
//   getUserDetails
// } = require('../../controllers/admin/user/getUserDetails');

// const {
//   updateUser
// } = require('../../controllers/admin/user/updateUser');

// const {
//   deleteUser
// } = require('../../controllers/admin/user/deleteUser');



// router.post('/create', adminAuthenticate, createUser);
// router.get("/list", adminAuthenticate, getUserList);
// router.get("/:id", adminAuthenticate, getUserDetails);
// router.patch("/update/:userId", adminAuthenticate, updateUser);
// router.delete("/delete/:userId", adminAuthenticate, deleteUser);


module.exports = router;
