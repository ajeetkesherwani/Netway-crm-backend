const catchAsync = require("../../../utils/catchAsync");
const AppError = require("../../../utils/AppError");
const { successResponse } = require("../../../utils/responseHandler");
const UserWalletHistory = require("../../../models/userWalletHistory");

exports.getRefundHistory = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 10, userId } = req.query;

  let query = { purpose: "plan-refund" };
  if (userId) {
    query.userId = userId;
  }

  const skip = (Math.max(1, parseInt(page)) - 1) * parseInt(limit);

  const historyDocs = await UserWalletHistory.find(query)
    .populate({
      path: "relatedPurchasePlanId",
      populate: {
        path: "packageId",
        select: "name basePrice"
      }
    })
    .populate("userId", "name email username")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await UserWalletHistory.countDocuments(query);

  const formattedHistory = historyDocs.map(entry => {
    return {
      _id: entry._id,
      refundDate: entry.createdAt,
      refundAmount: entry.transferAmount,
      planName: entry.relatedPurchasePlanId?.packageId?.name || "N/A",
      planId: entry.relatedPurchasePlanId?._id || null,
      user: entry.userId,
      remark: entry.remark
    };
  });

  return successResponse(res, "Refund history fetched successfully", {
    history: formattedHistory,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / parseInt(limit))
    }
  });
});
