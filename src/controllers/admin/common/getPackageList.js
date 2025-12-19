const Package = require("../../../models/package");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");

exports.getPackageList = catchAsync(async(req, res, next) => {

   const { type } = req.query;

    let filter = {};

    if (type === "ott") {
      filter.isOtt = true;
    }

    if (type === "iptv") {
      filter.isIptv = true;
    }

     const packages = await Package.find(filter)
      .sort({ createdAt: -1 })
      .lean();

      return successResponse(res, "package list found successfully", packages);
});