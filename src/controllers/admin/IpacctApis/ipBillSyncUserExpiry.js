const { syncIpacctUserExpiry } = require("../../../services/ipacctUserServices");
const User = require("../../../models/user");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");

/**
 * Controller to sync a CRM user's expiry date to IPACCT
 * Expected payload: { userId: "...", newExpiryDate: "YYYY-MM-DD" }
 */
exports.syncUserExpiryToIpacct = catchAsync(async (req, res, next) => {
  const { userId, newExpiryDate } = req.body;

  if (!userId || !newExpiryDate) {
    return next(new AppError("userId and newExpiryDate are required", 400));
  }

  // Find the CRM user
  const user = await User.findById(userId);
  if (!user) {
    return next(new AppError("User not found in CRM", 404));
  }

  // Get the numeric IPACCT ID that we saved during creation
  const ipacctUserId = user.generalInformation?.ipactId;

  if (!ipacctUserId) {
    return next(new AppError("This user does not have an associated IPACCT numeric ID (ipactId)", 400));
  }

  // Call the IPACCT service using the numeric ID
  const ipacctRes = await syncIpacctUserExpiry(ipacctUserId, newExpiryDate);

  // Check if IPACCT returned an error
  if (ipacctRes && ipacctRes.error) {
    return next(new AppError(`IPACCT Error: ${ipacctRes.error}`, 500));
  }

  // Optionally check code/message if it's available in the successful SOAP envelope
  if (ipacctRes && ipacctRes.code && ipacctRes.code._ !== "0") {
     return next(new AppError(`IPACCT Error: ${ipacctRes.message?._ || "Unknown error"}`, 500));
  }

  res.status(200).json({
    success: true,
    message: "Expiry date synced to IPACCT successfully",
    data: ipacctRes,
  });
});
