const ConnectionRequest = require("../../../models/connectionRequest");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");

exports.createConnectionRequest = catchAsync(async (req, res, next) => {
    const { name, mobile, email, address, comment } = req.body;

    if (!name || !mobile || !email || !address || !comment) {
        return next(new AppError("All fields are required", 400));
    }

    const newRequest = await ConnectionRequest.create({
        name,
        mobile,
        email,
        address,
        comment
    });
    return successResponse(res, "Connection request created successfully", newRequest);
});
