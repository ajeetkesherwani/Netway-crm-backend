// // const Order = require("../../../models/mainOrder");
// // const AppError = require("../../../utils/AppError");
// // const catchAsync = require("../../../utils/catchAsync");
// // const { successResponse } = require("../../../utils/responseHandler");

// // const validOrderStatus = [
// //     "placed",
// //     "confirmed",
// //     "shipped",
// //     "delivered",
// //     "cancelled",
// //     "returned",
// // ];

// // exports.getAllOrderList = catchAsync(async (req, res, next) => {

// //     const { type } = req.params;
// //     const { isDriverAssign } = req.query;

// //     let query = {};

// //     if (isDriverAssign === "true") {
// //         query.isDriverAssign = true;
// //     }

// //     if (type === "all") {
    
// //     } else if (validOrderStatus.includes(type)) {

// //         query.orderStatus = type;
// //     } else {
// //         return next(new AppError("Invalid type. it should ne 'all' or one of the:" + validOrderStatus.toLocaleString(", "), 400));
// //     }

// //     const orderList = await Order.find(query).lean();
// //     if (!orderList || orderList.length === 0) {
// //         return next(new AppError("orderList not found", 404));
// //     }

// //     successResponse(res, "ALl orderList Found", orderList);

// // });

// const Order = require("../../../models/mainOrder");
// const AppError = require("../../../utils/AppError");
// const catchAsync = require("../../../utils/catchAsync");
// const { successResponse } = require("../../../utils/responseHandler");

// const validOrderStatus = [
//   "placed",
//   "confirmed",
//   "shipped",
//   "delivered",
//   "cancelled",
//   "returned"
// ];

// exports.getAllOrderList = catchAsync(async (req, res, next) => {
//   const { type } = req.params;              // e.g., 'all', 'shipped', etc.
//   const { isDriverAssign } = req.query;     // optional query param

//   let query = {};

//   // Handle driver assignment filter if provided
//   if (isDriverAssign === "true") {
//     query.isDriverAssign = true;
//   }

//   // Handle order status filtering
//   if (type === "all") {
//     // No need to modify query
//   } else if (validOrderStatus.includes(type)) {
//     query.orderStatus = type;
//   } else {
//     return next(
//       new AppError(
//         `Invalid type. It should be 'all' or one of: ${validOrderStatus.join(", ")}`,
//         400
//       )
//     );
//   }

//   // Fetch orders from DB
//   const orderList = await Order.find(query).lean();

//   if (!orderList || orderList.length === 0) {
//     return next(new AppError("No orders found", 404));
//   }

//   return successResponse(res, "All order list found successfully", orderList);
// });

const Order = require("../../../models_old/mainOrder");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");
const paginate = require("../../../utils/paginate"); // adjust the path as needed

const validOrderStatus = [
  "placed",
  "confirmed",
  "shipped",
  "delivered",
  "cancelled",
  "returned"
];

exports.getAllOrderList = catchAsync(async (req, res, next) => {
  const { type } = req.params;
  const { isDriverAssign, page = 1, limit = 10 } = req.query;

  let query = {};

  // Filter by driver assignment
  if (isDriverAssign === "true") {
    query.isDriverAssign = true;
  }

  // Filter by order status
  if (type === "all") {
    // No status filter
  } else if (validOrderStatus.includes(type)) {
    query.orderStatus = type;
  } else {
    return next(
      new AppError(
        `Invalid type. It should be 'all' or one of: ${validOrderStatus.join(", ")}`,
        400
      )
    );
  }

  // Paginate result
  const paginatedResult = await paginate(Order, query, {
    page,
    limit,
    populate: "" // add fields to populate if needed
  });

  // If no data found
  if (!paginatedResult.paginateData || paginatedResult.paginateData.length === 0) {
    return next(new AppError("No orders found", 404));
  }

  // Success
  return successResponse(res, "Order list fetched successfully", paginatedResult);
});

