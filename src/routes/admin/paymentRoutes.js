const express = require('express');
const router = express.Router();
const paymentController = require('../../controllers/admin/payment/paymentController');
const {getPendingPayments} = require('../../controllers/admin/payment/getPendingPayments');
const {getCompletePayments} = require('../../controllers/admin/payment/getCompletePayments');
const {getFilteredPayments} = require('../../controllers/admin/payment/paymentFilter');
const {
  adminAuthenticate,
} = require("../../controllers/admin/auth/adminAuthenticate");

router.post('/create', adminAuthenticate,paymentController.createPayment);
router.get('/', adminAuthenticate,paymentController.getAllPayments);
router.get('/pendingPayments', adminAuthenticate, getPendingPayments);
router.get('/completePayments', adminAuthenticate, getCompletePayments);
router.get('/:id', adminAuthenticate,paymentController.getPaymentById);
router.put('/:id', adminAuthenticate,paymentController.updatePayment);
router.delete('/:id', adminAuthenticate,paymentController.deletePayment);
router.get('/filter/payments',  getFilteredPayments);


module.exports = router;