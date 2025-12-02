const Reseller = require("../../../models/retailer");
const Lco = require("../../../models/lco");
const Staff = require("../../../models/Staff");
const AppError = require("../../../utils/AppError");
const { successResponse } = require("../../../utils/responseHandler");
const catchAsync = require("../../../utils/catchAsync");

exports.getAssignToUsersList = catchAsync(async (req, res, next) => {
    const user = req.user;
    console.log(user, "req.user");

    let userList = [];

    if (user.role === "Admin") {
        userList = await Staff.find({}, "name").lean();
    } else if (user.role === "Reseller") {
        const reseller = await Reseller.findById(user._id).select("employeeAssociation");
        if (!reseller) return next(new AppError("Reseller not found", 404));
        userList = reseller.employeeAssociation || [];
    } else if (user.role === "Lco") {
        const lco = await Lco.findById(user._id).select("employeeAssociation");
        if (!lco) return next(new AppError("LCO not found", 404));
        userList = lco.employeeAssociation || [];
    } else {
        return next(new AppError("Unauthorized role for this action", 403));
    }

    successResponse(res, "Assignable user list fetched successfully", userList);
});
