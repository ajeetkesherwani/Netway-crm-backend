const express = require('express');
const router = express.Router();
const webUserController = require('../../controllers/admin/webuser/webUserController');
const {
  adminAuthenticate,
} = require("../../controllers/admin/auth/adminAuthenticate");

router.post('/create', adminAuthenticate,webUserController.createWebUser);
router.get('/', adminAuthenticate,webUserController.getAllWebUsers);
router.get('/:id', adminAuthenticate,webUserController.getWebUserById);
router.put('/:id', adminAuthenticate,webUserController.updateWebUser);
router.delete('/:id', adminAuthenticate,webUserController.deleteWebUser);

module.exports = router;
