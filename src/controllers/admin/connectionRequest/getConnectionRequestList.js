const ConnectionRequest = require("../../../models/connectionRequest");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse, errorResponse } = require("../../../utils/responseHandler");

exports.getAllConnectionRequestList = catchAsync(async (req, res, next) => {

    const connectionRequests = await ConnectionRequest.find().sort({ createdAt: -1 }).lean();

    return successResponse(res, "Connection request list fetched successfully", connectionRequests);

});