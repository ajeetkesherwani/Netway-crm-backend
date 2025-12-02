const LastSettlementHistory = require("../../../models/lastSettlementHistory");
const VendorWalletHistory = require("../../../models/vendorWalletHistory");
const { successResponse } = require("../../../utils/responseHandler");

exports.getPaymentSettlement = (async (req, res, next) => {

    const { type } = req.query;

    const vendorId = req.vendor._id;

    let filter = { vendorId };
    if (type === "settled") filter.status = "settled";
    if (type === "pending") filter.status = "pending";

    const totalOrders = await VendorWalletHistory.countDocuments(filter);

    const walletHistory = await VendorWalletHistory.find(filter)
        .select("orderId amount type status")


    const totalAmountAgg = await VendorWalletHistory.aggregate([
        { $match: filter },
        { $group: { _id: null, total: { $sum: "$amount" }}}
    ]);
    const totalAmount = totalAmountAgg.length > 0 ? totalAmountAgg[0].total : 0;

    const totalPendingAmountAgg = await VendorWalletHistory.aggregate([
        { $match: { vendorId, status: "pending" } },
        { $group: { _id: null, total: { $sum: "$amount" }}}
    ]);
    const totalPendingAmount = totalPendingAmountAgg.length > 0 ? totalPendingAmountAgg[0].total : 0;

    const lastSettlement = await LastSettlementHistory.findOne({ vendorId });

    const responseData = {
        vendorId,
        total_Orders: totalOrders,
        total_amount: totalAmount,
        walletHistory,
        total_pending_amount: totalPendingAmount,
        settlement_history: {
            last_settlement_amount: lastSettlement?.lastSettlementAmount || 0,
            lastSettlementDate: lastSettlement?.lastSettlementDate || new Date()
        },
        bank_details: {
            account_name: req.vendor.holderName,
            account_number: req.vendor.accountNo,
            ifsc_code: req.vendor.ifsc,
            bank_name: req.vendor.bankName
        }
    };

    successResponse(res, "paymentSettlement", responseData);

});