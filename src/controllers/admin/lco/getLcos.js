const Lco = require("../../../models/lco");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");

exports.getLcos = catchAsync(async (req, res, next) => {
  const user = req.user;
  const { search, page = 1, limit = 10 } = req.query;

  if (user.role !== "Admin" && user.role !== "Reseller") {
    return next(
      new AppError("You are not authorized to access this resource", 403)
    );
  }

  // Query setup
  const query = {};
  if (user.role === "Reseller") {
    query = { retailerId: user._id }; // Reseller sees only their LCOs
  }
  // Admin sees all LCOs (query is empty)

  if (search) {
    const safeSearch = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    const orConditions = [
      { email: { $regex: safeSearch, $options: "i" } },
      { lcoName: { $regex: safeSearch, $options: "i" } },
    ];

    if (!isNaN(search)) {
      orConditions.push({ mobileNo: Number(search) });
    }

    query.$or = orConditions;
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  // Fetch LCOs and populate retailer name
  const lcoList = await Lco.find(query)
    .skip(skip)
    .limit(parseInt(limit))
    .select("email lcoName mobileNo");
  if (!lcoList || lcoList.length === 0) {
    return next(new AppError("LCO not found", 404));
  }

  successResponse(res, "LCO found successfully", lcoList);
});
