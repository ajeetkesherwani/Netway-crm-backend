const User = require("../../../../models/user");
const Admin = require("../../../../models/admin");
const PurchasedPlan = require("../../../../models/purchasedPlan");
const AppError = require("../../../../utils/AppError");
const catchAsync = require("../../../../utils/catchAsync");
const { successResponse } = require("../../../../utils/responseHandler");
const Reseller = require("../../../../models/retailer");
const Lco = require("../../../../models/lco");
const ResellerWalletHistory = require("../../../../models/resellerWallerHistory")

exports.onlineTransaction = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 10 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const total = await ResellerWalletHistory.countDocuments();

  const transactionData = await ResellerWalletHistory.find()
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit))
    .populate("reseller", "resellerName")
    .lean();

  const mappedTransactions = await Promise.all(transactionData.map(async (tx) => {
    let createdByName = "";
    const admin = await Admin.findById(tx.createdById).select("name").lean();
    console.log("admin data",admin);
    if (admin) createdByName = admin.name;
    return {
      ...tx,
      createdByName
    };
  }));

  return successResponse(res, "Transactions fetched successfully", {
    total,
    page: parseInt(page),
    limit: parseInt(limit),
    data: mappedTransactions
  });
});



