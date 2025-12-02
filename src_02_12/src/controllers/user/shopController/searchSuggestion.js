const Vendor = require("../../../models/vendor");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");

exports.searchSuggestion = catchAsync(async (req, res) => {
  const { q } = req.query;
  if (!q || !q.trim()) {
    return successResponse(res, "No search query provided", []);
  }

  // Find vendors with shopName similar to query, only return _id and shopName
  const vendors = await Vendor.find({
    shopName: { $regex: q, $options: "i" },
  }).select("_id shopName");

  return successResponse(res, "Search suggestions", vendors);
});
