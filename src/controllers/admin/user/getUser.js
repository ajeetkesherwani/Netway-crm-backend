const { default: mongoose } = require("mongoose");
const User = require("../../../models/user");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");
// const sendEmail = require("../../../utils/sendEmail");

exports.getUserList = catchAsync(async (req, res, next) => {
  const {
    searchQuery,
    status,
    area,
    ekyc,
    startDate,
    endDate,
    serviceOpted,
    reseller,
    lco,
  } = req.query;

  const query = {};
  if (searchQuery && searchQuery.trim()) {
    const safeSearch = searchQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    query.$or = [
      { "generalInformation.name": { $regex: safeSearch, $options: "i" } },
      { "generalInformation.username": { $regex: safeSearch, $options: "i" } },
      { "generalInformation.email": { $regex: safeSearch, $options: "i" } },
      { "generalInformation.phone": { $regex: safeSearch, $options: "i" } },
    ];
  }
  if (area) {
    query["addressDetails.area"] = new mongoose.Types.ObjectId(area);
  }

  if (status) {
    query.status = status;
  }

  if (ekyc) {
    query["additionalInformation.ekyc"] = ekyc;
  }

  if (serviceOpted) {
    query["generalInformation.serviceOpted"] = serviceOpted;
  }
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      query.createdAt.$lte = end;
    }
  }
  if (reseller) {
    query["generalInformation.createdFor.type"] = "Retailer";
    query["generalInformation.createdFor.id"] = new mongoose.Types.ObjectId(
      reseller
    );
  } else if (lco) {
    query["generalInformation.createdFor.type"] = "Lco";
    query["generalInformation.createdFor.id"] = new mongoose.Types.ObjectId(
      lco
    );
  }

  const user = await User.find(query);
  if (!user) return next(new AppError("User not found", 404));

  successResponse(res, "User found successfully", user);
});
