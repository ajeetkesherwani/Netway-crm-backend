
const express = require('express');
const router = express.Router();

const {
    adminAuthenticate,
} = require('../../controllers/admin/auth/adminAuthenticate');
const paymentModeSectionController = require('../../controllers/admin/paymentmode/paymentmodesection');

// Protect all routes
router.use(adminAuthenticate);

// Create
router.post('/', paymentModeSectionController.createPaymentModeSection);

// Get all
router.get('/', paymentModeSectionController.getPaymentModeSections);

// Get by ID
router.get('/:id', paymentModeSectionController.getPaymentModeSectionById);

// Update
router.patch('/:id', paymentModeSectionController.updatePaymentModeSection);

// Delete
router.delete('/:id', paymentModeSectionController.deletePaymentModeSection);

module.exports = router;
