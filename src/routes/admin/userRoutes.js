const express = require('express');
const router = express.Router();
const {
  adminAuthenticate,
} = require("../../controllers/admin/auth/adminAuthenticate");

const userController = require('../../controllers/admin/user/userController');

router.post('/create', adminAuthenticate,userController.createUser);
router.get('/list', adminAuthenticate,userController.getAllUsers);
router.get('/:id', adminAuthenticate,userController.getUserById);
router.put('/:id', adminAuthenticate,userController.updateUser);
router.delete('/delete/:id', adminAuthenticate,userController.deleteUser);

module.exports = router;
