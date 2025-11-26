const User = require("../../../models/user");
const PurchasedPlan = require("../../../models/purchasedPlan");
const Log = require("../../../models/activityLog");
const Payment = require("../../../models/payment");
const Ticket = require("../../../models/ticket");
const catchAsync = require("../../../utils/catchAsync");
const AppError = require("../../../utils/AppError");

exports.getUserFullDetails = catchAsync(async (req, res, next) => {
  const { userId } = req.params;

  // USER BASIC DETAILS
  const user = await User.findById(userId)
    .populate("generalInformation.createdBy.id")
    .populate("generalInformation.selsExecutive")
    .populate("generalInformation.installationBy")
    .populate("addressDetails.area")
    .populate("packageInfomation.packageId")
    .lean();

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  // USER PURCHASED PLANS
  const purchasedPlans = await PurchasedPlan.find({ userId })
    .populate("userId", "generalInformation.name generalInformation.username")  
    .populate("purchasedById")
    .populate("packageId")
    .lean();
    console.log("purchedPlans", purchasedPlans)

    //user payment histor
    const payments = await Payment.find({ userId }).sort({ createdAt: -1 }).lean();

  // USER LOGS
  const logs = await Log.find({ userId }).sort({ createdAt: -1 }).lean();

  //user Tickets
  const tickets = await Ticket.find({ userId })  .populate({
    path: "assignToId",
    select: "name lcoName resellerName"
  })
  .sort({ createdAt: -1 }).lean();

  // RETURN RESPONSE WITHOUT EXTRA 'data' WRAPPER
  return res.status(200).json({
    status: true,
    message: "User full data fetched successfully",
    userDetails: user,
    purchasedPlans,
    logs,
    payments,
    tickets
  });
});

