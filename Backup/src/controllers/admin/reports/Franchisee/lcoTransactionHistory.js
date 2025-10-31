const User = require("../../../../models/user");
const Admin = require("../../../../models/admin");
const PurchasedPlan = require("../../../../models/purchasedPlan");
const AppError = require("../../../../utils/AppError");
const catchAsync = require("../../../../utils/catchAsync");
const { successResponse } = require("../../../../utils/responseHandler");
const Reseller = require("../../../../models/retailer");
const Lco = require("../../../../models/lco");
const LcoWalletHistory = require("../../../../models/lcoWalletHistory")

exports.lcoTransactionHistory = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 10 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const total = await LcoWalletHistory.countDocuments();

  const transactionData = await LcoWalletHistory.find()
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit))
    .populate("lco", "lcoName")
    .populate("reseller", "resellerName")
    .lean();

  const mappedTransactions = await Promise.all(transactionData.map(async (tx) => {
    let createdByName = "";

    if (tx.createdBy === "Admin" && tx.createdById) {
      const admin = await Admin.findById(tx.createdById).select("name").lean();
      console.log("admin data",admin);
      if (admin) createdByName = admin.name;
    } else if (tx.createdBy === "Reseller" && tx.createdById) {
      const reseller = await Reseller.findById(tx.createdById).select("resellerName").lean();
      console.log("reseller data",reseller);
      if (reseller) createdByName = reseller.resellerName;
    }

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



