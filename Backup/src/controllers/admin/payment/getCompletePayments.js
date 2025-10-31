const Payment = require('../../../models/payment');
const { successResponse, errorResponse } = require('../../../utils/responseHandler');
const AppError = require("../../../utils/AppError");

exports.getCompletePayments = async (req, res) => {
  try {
    const completePayments = await Payment.find({ paymentStatus: 'Completed' }).populate('userId', 'fullName email').select('ReceiptNo userId totalAmount dueAmount PaymentDate paymentStatus');
    console.log(completePayments);
    successResponse(res, 'Complete payments fetched successfully', completePayments);
  } catch (error) {
    errorResponse(res, 'Failed to fetch complete payments', error.message);
  }
};