const User = require("../../../models/user");
const AppError = require("../../../utils/AppError");
const { successResponse } = require("../../../utils/responseHandler");
const catchAsync = require("../../../utils/catchAsync");

exports.searchUsersByName = catchAsync(async (req, res, next) => {

    const { query } = req.query;

    if (!query || query.trim() === "") {
        return next(new AppError("Search query is required", 400));
    }

    const regex = new RegExp("^" + query, "i");


    const users = await User.find({
        "generalInformation.name": regex
    });


    if (!users || users.length === 0) {
        return successResponse(res, "No users found", []);
    }

    successResponse(res, "Users found successfully", users);
});
