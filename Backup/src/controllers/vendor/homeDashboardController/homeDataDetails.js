const SubOrder = require("../../../models/SubOrder");
const AppError = require("../../../utils/AppError");
const { successResponse } = require("../../../utils/responseHandler");

exports.getDataDetails = (async (req, res, next) => {

    const vendorId = req.vendor._id;

    const { search = "", fromDate, toDate } = req.query;

    if (!vendorId) return next(new AppError("vendorId is required", 400));

    const match = { vendorId };

    if (fromDate && toDate) {
        match.createdAt = {
            $gte: new Date(fromDate),
            $lte: new Date(toDate)
        };
    }

    const subOrder = await SubOrder.find(match)
        .populate({
            path: "mainOrderId",
            select: "orderNumber createdAt user_Id",
            populate: {
                path: "user_Id",
                model: "User",
                select: "name"
            }
        })
        .populate("products.productId", "name primary_image");

    const result = [];
    const regex = new RegExp(search, "i");

    for (const sub of subOrder) {
        const orderNumber = sub.mainOrderId?.orderNumber
        const customerName = sub.mainOrderId?.user_Id?.name

        for (const p of sub.products) {
           const productName = p.productId?.name;

            const isMatch =
                regex.test(orderNumber?.toString()) ||
                regex.test(customerName || "") ||
                regex.test(productName || "");

            if (search && !isMatch) continue;
            result.push({
                productImage: p.productId?.primary_image,
                productName,
                orderNumber: `${orderNumber}`,
                date: sub.createdAt,
                customerName,
                quantity: p.quantity,
                price: p.price,
                gst: p.gstPercentage,
                discountPrice: p.discountedPrice,
                total: p.totalItemAmount,
            })
        }
    }

    successResponse(res, "all sales and return data details", result);

});