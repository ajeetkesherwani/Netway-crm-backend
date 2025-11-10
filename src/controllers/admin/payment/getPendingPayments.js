const Payment = require('../../../models/payment');
const { successResponse, errorResponse } = require('../../../utils/responseHandler');
const AppError = require("../../../utils/AppError");

exports.getPendingPayments = async (req, res) => {
  try {
    const pendingPayments = await Payment.find({ paymentStatus: 'Pending' })
      .populate({
        path: 'userId',
        select: 'generalInformation.name generalInformation.username generalInformation.email'
      }).select('ReceiptNo userId totalAmount dueAmount PaymentDate paymentStatus');
    console.log(pendingPayments);
    successResponse(res, 'Pending payments fetched successfully', pendingPayments);
  } catch (error) {
    errorResponse(res, 'Failed to fetch pending payments', error.message);
  }
};