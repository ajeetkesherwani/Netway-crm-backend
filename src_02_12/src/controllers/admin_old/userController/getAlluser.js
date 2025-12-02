const User = require("../../../models_old/user");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const paginate = require("../../../utils/paginate");
const { successResponse } = require("../../../utils/responseHandler");

exports.getAllUser = catchAsync(async(req, res, next) => {

    const { page, limit } = req.query;

    const allUser = await paginate(User, {}, {
        page,
        limit,
        sort: { createdAt: -1},
    })

    // const allUser = await User.find()
    // .lean();

    if(!allUser|| allUser.paginateData.length === 0) return next(new AppError("User not found",404 ));

    successResponse(res, "All User found", allUser);

});