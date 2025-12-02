// const SubOrder = require("../../../models/SubOrder");
// const User = require("../../../models/user");
// const Vendor = require("../../../models/vendor");
// const Driver = require("../../../models/driver");
// const catchAsync = require("../../../utils/catchAsync");
// const { successResponse } = require("../../../utils/responseHandler");

// const getDateRange = (filterType) => {
//     const now = new Date();
//     let startDate;

//     switch (filterType) {
//         case "today":
//             startDate = new Date();
//             startDate.setHours(0, 0, 0, 0);
//             break;
//         case "week":
//             startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
//             break;
//         case "month":
//             startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
//             break;
//         case "quarter":
//             startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
//             break;
//         default:
//             return {};
//     }

//     return {
//         createdAt: {
//             $gte: startDate,
//             $lte: now
//         }
//     };
// };

// exports.getAdminDashboardData = catchAsync(async (req, res, next) => {

//     const { filter = "today" } = req.query;

//     const dateFilter = getDateRange(filter);

//     // =============== Orders ===============
//     const allOrders = await SubOrder.find(dateFilter)
//         .populate({
//             path: "products.productId",
//             populate: {
//                 path: "serviceId",
//                 model: "Service"
//             }
//         })
//         .lean();

//     const totalOrders = allOrders.length;

//     const deliveredOrders = allOrders.filter(order => order.status === "delivered");

//     const pendingOrders = await SubOrder.countDocuments({ status: "pending", ...dateFilter });

//     const returnOrderCount = await SubOrder.countDocuments({
//         status: { $in: ["return_requests", "return_received"] },
//         ...dateFilter
//     });

//     // Revenue Calculation
//     let clothing = 0, footwear = 0, accessories = 0;
//     let clothingRevenue = 0, footwearRevenue = 0, accessoriesRevenue = 0;
//     let totalRevenue = 0;

//     deliveredOrders.forEach(order => {
//         order.products.forEach(item => {
//             const serviceName = item.productId?.serviceId?.name;
//             const amount = item.totalItemAmount || 0;

//             totalRevenue += amount;

//             if (serviceName === "Clothing") {
//                 clothing++;
//                 clothingRevenue += amount;
//             } else if (serviceName === "Footwear") {
//                 footwear++;
//                 footwearRevenue += amount;
//             } else if (serviceName === "Accessories") {
//                 accessories++;
//                 accessoriesRevenue += amount;
//             }
//         });
//     });

//     // Users 
//     const activeCustomers = await User.countDocuments({ isVerified: true, ...dateFilter });
//     const newRegisteredCustomers = await User.countDocuments({ status: false, ...dateFilter });
//     const flaggedCustomers = await User.countDocuments({ isVerified: false, ...dateFilter });

//     // Vendors
//     const activeRetailers = await Vendor.countDocuments({ status: true, ...dateFilter });
//     const newRegisteredRetailers = await Vendor.countDocuments({ status: false, ...dateFilter });
//     const flaggedRetailers = await Vendor.countDocuments({ isBlocked: true, ...dateFilter });

//     // Drivers
//     const activeDeliveryBoys = await Driver.countDocuments({ isVerified: true, ...dateFilter });
//     const newRegisteredDeliveryBoys = await Driver.countDocuments({ isVerified: false, ...dateFilter });
//     const flaggedDeliveryBoys = await Driver.countDocuments({ isBlocked: true, ...dateFilter });

//     // Response 
//     return successResponse(res, "Admin Dashboard Data", {
//         totalOrders,
//         orderCountByService: {
//             clothing,
//             footwear,
//             accessories
//         },
//         pendingOrders,
//         returnOrderCount,
//         totalRevenue,
//         revenueByService: {
//             clothing: clothingRevenue,
//             footwear: footwearRevenue,
//             accessories: accessoriesRevenue
//         },
//         customers: {
//             active: activeCustomers,
//             newRegistered: newRegisteredCustomers,
//             flagged: flaggedCustomers
//         },
//         retailers: {
//             active: activeRetailers,
//             newRegistered: newRegisteredRetailers,
//             flagged: flaggedRetailers
//         },
//         deliveryBoys: {
//             active: activeDeliveryBoys,
//             newRegistered: newRegisteredDeliveryBoys,
//             flagged: flaggedDeliveryBoys
//         }
//     });
// });


const SubOrder = require("../../../models_old/SubOrder");
const User = require("../../../models_old/user");
const Vendor = require("../../../models_old/vendor");
const Driver = require("../../../models_old/driver");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");

const getDateRange = (filterType) => {
    const now = new Date();
    let startDate;

    switch (filterType) {
        case "today":
            startDate = new Date();
            startDate.setHours(0, 0, 0, 0);
            break;
        case "week":
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
        case "month":
            startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            break;
        case "quarter":
            startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
            break;
        default:
            return {};
    }

    return {
        createdAt: {
            $gte: startDate,
            $lte: now
        }
    };
};

exports.getAdminDashboardData = catchAsync(async (req, res, next) => {

    const { filter = "today" } = req.query;

    const dateFilter = getDateRange(filter);

    // =============== Orders ===============
    const allOrders = await SubOrder.find(dateFilter)
        .populate({
            path: "products.productId",
            populate: {
                path: "serviceId",
                model: "Service"
            }
        })
        .lean();

    const totalOrders = allOrders.length;

    const deliveredOrders = allOrders.filter(order => order.status === "delivered");

    const pendingOrders = await SubOrder.countDocuments({ status: "pending", ...dateFilter });

    const returnOrderCount = await SubOrder.countDocuments({
        status: { $in: ["return_requests", "return_received"] },
        ...dateFilter
    });

    // Revenue Calculation
    let clothing = 0, footwear = 0, accessories = 0;
    let clothingRevenue = 0, footwearRevenue = 0, accessoriesRevenue = 0;
    let totalRevenue = 0;

    deliveredOrders.forEach(order => {
        order.products.forEach(item => {
            const serviceName = item.productId?.serviceId?.name;
            const amount = item.totalItemAmount || 0;

            totalRevenue += amount;

            if (serviceName === "Clothing") {
                clothing++;
                clothingRevenue += amount;
            } else if (serviceName === "Footwear") {
                footwear++;
                footwearRevenue += amount;
            } else if (serviceName === "Accessories") {
                accessories++;
                accessoriesRevenue += amount;
            }
        });
    });

    // Users 
    const activeCustomers = await User.countDocuments({
        isVerified: true,
        updatedAt: dateFilter.createdAt
    });

    const newRegisteredCustomers = await User.countDocuments({
        status: false,
        ...dateFilter
    });

    const flaggedCustomers = await User.countDocuments({
        isVerified: false,
        updatedAt: dateFilter.createdAt
    });

    // Vendors
    const activeRetailers = await Vendor.countDocuments({
        status: true,
        updatedAt: dateFilter.createdAt
    });

    const newRegisteredRetailers = await Vendor.countDocuments({
        status: false,
        ...dateFilter
    });

    const flaggedRetailers = await Vendor.countDocuments({
        isBlocked: true,
        updatedAt: dateFilter.createdAt
    });

    // Drivers
    const activeDeliveryBoys = await Driver.countDocuments({
        isVerified: true,
        updatedAt: dateFilter.createdAt
    });

    const newRegisteredDeliveryBoys = await Driver.countDocuments({
        isVerified: false,
        ...dateFilter
    });

    const flaggedDeliveryBoys = await Driver.countDocuments({
        isBlocked: true,
        updatedAt: dateFilter.createdAt
    });

    // Response 
    return successResponse(res, "Admin Dashboard Data", {
        totalOrders,
        orderCountByService: {
            clothing,
            footwear,
            accessories
        },
        pendingOrders,
        returnOrderCount,
        totalRevenue,
        revenueByService: {
            clothing: clothingRevenue,
            footwear: footwearRevenue,
            accessories: accessoriesRevenue
        },
        customers: {
            active: activeCustomers,
            newRegistered: newRegisteredCustomers,
            flagged: flaggedCustomers
        },
        retailers: {
            active: activeRetailers,
            newRegistered: newRegisteredRetailers,
            flagged: flaggedRetailers
        },
        deliveryBoys: {
            active: activeDeliveryBoys,
            newRegistered: newRegisteredDeliveryBoys,
            flagged: flaggedDeliveryBoys
        }
    });
});

