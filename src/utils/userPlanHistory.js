const UserPlanHistory = require("../models/userPlanHistory");
 
exports.createHistory = async (
  userId,
  planId,
  amount,
  type, // purchase, renewal, upgrade
  paymentMethod,
  transactionId,
  details
) => {
  console.log("Creating user plan history with details:", {
    userId,
    planId,
    amount,
    type,
    paymentMethod,
    transactionId,
    details
  });
  await UserPlanHistory.create({
    userId: userId,
    planId,
    amount,
    type,
    paymentMethod,
    transactionId,
    details
  });
};
