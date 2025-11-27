const UserPlanHistory = require("../models/userPlanHistory");
 
exports.createHistory = async ({
  userId,
  planId,
  amount,
  type, // purchase, renewal, upgrade
  paymentMethod,
  transactionId,
  desciption
}) => {
  await UserPlanHistory.create({
    userId,
    planId,
    amount,
    type,
    paymentMethod,
    transactionId,
    desciption
  });
};