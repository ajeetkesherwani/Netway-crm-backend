const Role = require("../../../models/role");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");

exports.getStaffRoleList = catchAsync(async (req, res, next) => {

    const roles = await Role.find({
        roleName: {
            $not: {
                $regex: /^(admin|Reseller|Lco|Retailer|Manager|Operator)$/i,
            },
        },
    }).select("roleName");

    if (!roles || roles.length === 0) {
        return next(new AppError("No staff roles found.", 404));
    }

    successResponse(res, "Staff roles fetched successfully", roles);

});
