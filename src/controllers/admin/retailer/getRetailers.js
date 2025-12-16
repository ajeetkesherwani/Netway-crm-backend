const Retailer = require("../../../models/retailer");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");

exports.getRetailers = catchAsync(async (req, res, next) => {
  const user = req.user;
  const { search, page = 1, limit = 10 } = req.query;

  if (user.role !== "Admin") {
    return next(
      new AppError("You are not authorized to access this resource", 403)
    );
  }

  const query = {};
  if (search) {
    const safeSearch = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    const orConditions = [
      { email: { $regex: safeSearch, $options: "i" } },
      { resellerName: { $regex: safeSearch, $options: "i" } },
    ];

    if (!isNaN(search)) {
      orConditions.push({ phoneNo: Number(search) });
      orConditions.push({ mobileNo: Number(search) });
    }

    query.$or = orConditions;
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const retailer = await Retailer.find(query)
    .skip(skip)
    .limit(parseInt(limit))
    .select("phoneNo email mobileNo resellerName");
  if (!retailer) return next(new AppError("reatiler not found", 404));

  successResponse(res, "retailer found successfully", retailer);
});
