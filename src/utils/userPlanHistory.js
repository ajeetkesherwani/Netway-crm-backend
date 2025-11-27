const UserPlanHistory = require("../models/userPlanHistory");

exports.createHistory = async ({
  userId,
  planId,
  amount,
  type, // purchase, renewal, upgrade
  paymentMethod,
  transactionId,
  details
}) => {
  await UserPlanHistory.create({
    userId,
    planId,
    amount,
    type,
    paymentMethod,
    transactionId,
    details
  });
};
