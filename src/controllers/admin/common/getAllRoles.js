const Role = require("../../../models/role");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");

exports.getAllRoles = catchAsync(async (req, res, next) => {

    const roles = await Role.find({}, "_id roleName").lean();
    successResponse(res, "Staff roles fetched successfully", roles);

});
