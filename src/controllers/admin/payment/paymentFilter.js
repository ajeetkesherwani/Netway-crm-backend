const Payment = require("../../../models/payment");
const User = require("../../../models/user");
const catchAsync = require("../../../utils/catchAsync");

exports.getFilteredPayments = catchAsync(async (req, res) => {
  const {
    userId,
    name,
    fromDate,
    toDate,
    status,
    area,
    zone,
    reseller,
    lco,
      paymentStatus,
  } = req.query;

  /* -------------------------
     PAYMENT FILTER
  ------------------------- */
  const paymentFilter = {};

  if (paymentStatus) {
    const normalized = paymentStatus.trim();
    if (normalized === "Completed" || normalized === "Pending") {
      paymentFilter.paymentStatus = normalized; // Exact match
    } else {
      paymentFilter.paymentStatus = {
        $regex: new RegExp(`^${normalized}$`, "i")
      };
    }
  }

//   if (paymentStatus) {
//   paymentFilter.paymentStatus = paymentStatus; 
//   // "Pending" | "Completed"
// }

  if (fromDate || toDate) {
    paymentFilter.createdAt = {};
    if (fromDate) paymentFilter.createdAt.$gte = new Date(fromDate);
    if (toDate) paymentFilter.createdAt.$lte = new Date(toDate);
  }

  /* -------------------------
     USER FILTER
  ------------------------- */
  const userFilter = {};

  if (userId) userFilter._id = userId;

if (name) {
  const searchRegex = { $regex: name.trim(), $options: "i" };

  userFilter.$or = [
    { "generalInformation.name": searchRegex },
    { "generalInformation.phone": searchRegex },   
    { "generalInformation.email": searchRegex },     
  ];
}

  if (status) userFilter.status = status;
  if (area) userFilter["addressDetails.area"] = area;
  if (zone) userFilter["addressDetails.subZone"] = zone;


if (reseller) {
  userFilter["generalInformation.createdFor.id"] = reseller;
  userFilter["generalInformation.createdFor.type"] = {
    $in: ["Retailer", "Reseller"]
  };
}

if (lco) {
  userFilter["generalInformation.createdFor.id"] = lco;
  userFilter["generalInformation.createdFor.type"] = "Lco";
}

  /* -------------------------
     FIND USERS FIRST
  ------------------------- */
  if (Object.keys(userFilter).length > 0) {
    const users = await User.find(userFilter).select("_id");
    const userIds = users.map((u) => u._id);

    if (userIds.length === 0) {
      return res.json({
        data: [],
        total: 0,
      });
    }

    paymentFilter.userId = { $in: userIds };
  }

  /* -------------------------
     FINAL QUERY
  ------------------------- */
  const payments = await Payment.find(paymentFilter)
    .populate("userId", "generalInformation status walletBalance")
    .sort({ createdAt: -1 });
    console.log(payments, "payments");

  const total = payments.length;

  res.json({
    data: payments,
    total,
  });
});
