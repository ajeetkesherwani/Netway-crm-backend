const SubOrder = require("../../../models/SubOrder");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");

exports.getHomeData = catchAsync(async (req, res, next) => {
    const vendorId = req.vendor._id;

    if (!vendorId) return next(new AppError("vendorId is required", 400));

    const [totalOrders, deliveredOrders, returnedOrder, exchangeOrders] = await Promise.all([
        SubOrder.countDocuments({ vendorId }),
        SubOrder.countDocuments({ vendorId, status: "delivered" }),
        SubOrder.countDocuments({ vendorId, status: "return received" }),
        SubOrder.countDocuments({ vendorId, status: "exchanged" })
    ]);

      const subOrdersWithProducts = await SubOrder.find({ vendorId }, 'products');

    let totalSales = 0;

    for (const sub of subOrdersWithProducts) {
        for (const p of sub.products) {
            totalSales += p.quantity; 
        }
    }

    const netDeliverdOrder = deliveredOrders - (returnedOrder - exchangeOrders);
    const returnRate = `${((returnedOrder / totalOrders) * 100).toFixed(2)}%`;
    const exchangeRate = `${((exchangeOrders / totalOrders) * 100).toFixed(2)}%`;

    const response = { 
        totalSales, 
        totalOrders, 
        deliveredOrders, 
        returnedOrder, 
        exchangeOrders, 
        netDeliverdOrder, 
        returnRate, 
        exchangeRate
     };

    successResponse(res, "found all data", response);

});


