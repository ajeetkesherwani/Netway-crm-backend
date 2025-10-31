const SubOrder = require("../../../models/SubOrder");
const AppError = require("../../../utils/AppError");
const { successResponse } = require("../../../utils/responseHandler");

exports.getAssignOrder = async (req, res, next) => {

       const driverId = req.driver._id;

    if (!driverId) return next(new AppError("driverId is not authenticated", 400));

    const subOrder = await SubOrder.findOne({
        assignDeliveryBoyId: driverId,
        isDeliveryAsign: true
    })
        .populate({
            path: "vendorId",
            select: "shopName shopAddress mobile"
        })
        .populate({
            path: "mainOrderId",
            select: "orderNumber expectedDeliveryTime address user_Id",
            populate: {
                path: "user_Id",
                model: "User",
                select: "name mobileNo location lat long"
            }
        })
        .select("_id products pickupotp expiresAt")
        .lean();

    if (!subOrder) return next(new AppError("No assigned suborder found", 404));

    const totalQuantity = subOrder.products?.reduce((sum, item) => sum + (item.quantity || 0), 0);

    const result = {
        orderId: subOrder._id,
        pickupFrom: {
            shopName: subOrder.vendorId?.shopName,
            vendorPhone: subOrder.vendorId?.mobile,
            vendorAddress: subOrder.vendorId?.shopAddress,
            orderNumber: subOrder.mainOrderId?.orderNumber,
            expectedDeliveryTime: subOrder.mainOrderId?.deliveryTime || "9:35AM",
            items: totalQuantity,
            otp: subOrder.pickupotp || 456892
        },
        deliveredTo: {
            userName: subOrder.mainOrderId?.user_Id?.name || "N/A",
            userPhone: subOrder.mainOrderId?.user_Id?.mobileNo || "N/A",
            orderNumber: subOrder.mainOrderId?.orderNumber,
            location: subOrder.mainOrderId?.user_Id?.location?.type,
            latitude: subOrder.mainOrderId?.user_Id?.lat,
            longitude: subOrder.mainOrderId?.user_Id?.long,
            expectedDeliveryTime: "9:35PM",
            items: totalQuantity
        }
    };

    successResponse(res, "Assigned order details fetched", result);
    
};

