// const User = require("../../../../models/user");
// const Admin = require("../../../../models/admin");
// const PurchasedPlan = require("../../../../models/purchasedPlan");
// const AppError = require("../../../../utils/AppError");
// const catchAsync = require("../../../../utils/catchAsync");
// const { successResponse } = require("../../../../utils/responseHandler");
// const Reseller = require("../../../../models/retailer");
// const Lco = require("../../../../models/lco");
// const LcoWalletHistory = require("../../../../models/lcoWalletHistory")

// exports.lcoBalanceTransfer = catchAsync(async (req, res, next) => {
//   const { page = 1, limit = 10 } = req.query;
//   const skip = (parseInt(page) - 1) * parseInt(limit);

//   const total = await LcoWalletHistory.countDocuments();

//   const transactionData = await LcoWalletHistory.find()
//     .sort({ createdAt: -1 })
//     .skip(skip)
//     .limit(parseInt(limit))
//     .populate("lco", "lcoName")
//     .populate("reseller", "resellerName")
//     .lean();

//   const mappedTransactions = await Promise.all(transactionData.map(async (tx) => {
//     let createdByName = "";

//     if (tx.createdBy === "Admin" && tx.createdById) {
//       const admin = await Admin.findById(tx.createdById).select("name").lean();
//       console.log("admin data",admin);
//       if (admin) createdByName = admin.name;
//     } else if (tx.createdBy === "Reseller" && tx.createdById) {
//       const reseller = await Reseller.findById(tx.createdById).select("resellerName").lean();
//       console.log("reseller data",reseller);
//       if (reseller) createdByName = reseller.resellerName;
//     }

//     return {
//       ...tx,
//       createdByName
//     };
//   }));

//   return successResponse(res, "Transactions fetched successfully", {
//     total,
//     page: parseInt(page),
//     limit: parseInt(limit),
//     data: mappedTransactions
//   });
// });


const User = require("../../../../models/user");
const Admin = require("../../../../models/admin");
const PurchasedPlan = require("../../../../models/purchasedPlan");
const AppError = require("../../../../utils/AppError");
const catchAsync = require("../../../../utils/catchAsync");
const { successResponse } = require("../../../../utils/responseHandler");
const Reseller = require("../../../../models/retailer");
const Lco = require("../../../../models/lco");
const LcoWalletHistory = require("../../../../models/lcoWalletHistory");

exports.lcoBalanceTransfer = catchAsync(async (req, res, next) => {
  const { 
    page = 1, 
    limit = 10, 
    searchField, 
    searchValue, 
    startDate, 
    endDate 
  } = req.query;

  const skip = (parseInt(page) - 1) * parseInt(limit);

  // 🔍 Build filter
  const filter = {};

  // Date range filter
  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate);
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999); // include full end day
      filter.createdAt.$lte = end;
    }
  }

  // Specific field-based filters
  if (searchField && searchValue) {
    const allowedFields = [
      "type",
      "openingBalance",
      "closingBalance",
      "amount",
    ];

    if (!allowedFields.includes(searchField)) {
      return next(new AppError("Invalid search field provided", 400));
    }

    // Handle numeric vs text filters
    if (["openingBalance", "closingBalance", "amount"].includes(searchField)) {
      const numericValue = parseFloat(searchValue);
      if (isNaN(numericValue)) {
        return next(
          new AppError(
            `${searchField} must be a valid number`,
            400
          )
        );
      }
      filter[searchField] = numericValue;
    } else if (searchField === "type") {
      filter.type = { $regex: searchValue, $options: "i" };
    }
  }

  // Get total filtered count
  const total = await LcoWalletHistory.countDocuments(filter);

  // Fetch filtered and paginated transactions
  const transactionData = await LcoWalletHistory.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit))
    .populate("lco", "lcoName")
    .populate("reseller", "resellerName")
    .lean();

  // Attach createdByName for each transaction
  const mappedTransactions = await Promise.all(
    transactionData.map(async (tx) => {
      let createdByName = "";

      if (tx.createdBy === "Admin" && tx.createdById) {
        const admin = await Admin.findById(tx.createdById)
          .select("name")
          .lean();
        if (admin) createdByName = admin.name;
      } else if (tx.createdBy === "Reseller" && tx.createdById) {
        const reseller = await Reseller.findById(tx.createdById)
          .select("resellerName")
          .lean();
        if (reseller) createdByName = reseller.resellerName;
      }

      return {
        ...tx,
        createdByName,
      };
    })
  );

  return successResponse(res, "Transactions fetched successfully", {
    total,
    page: parseInt(page),
    limit: parseInt(limit),
    data: mappedTransactions,
  });
});

