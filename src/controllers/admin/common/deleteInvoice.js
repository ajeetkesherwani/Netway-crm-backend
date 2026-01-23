const Invoice = require("../../../models/invoice");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");

exports.deleteInvoice = catchAsync(async(req, res, next) => {

    const { invoiceId } = req.params;
    console.log(req.params);

    if(!invoiceId) {
        return next(new AppError("invoiceId is required",400));
    }

    const invoice  = await Invoice.findByIdAndDelete({ _id: invoiceId});
    if(!invoice){
        return next(new AppError("Invoice not found",400));
    }

    successResponse(res, "Invoce delete successfully", invoice);

});