const Staff = require("../../../models/Staff");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");

exports.updateStaff = catchAsync(async (req, res, next) => {

    const { id } = req.params;

    if (!id) return next(new AppError("staff id is required", 400));

    const staff = await Staff.findById(id);
    if (!staff) return next(new AppError("staff not found", 404));

    const updatableFields = [
        "name", "userName", "email", "password", "phoneNo", "address", "bio", "roleId", "logId", "staffName", "salary",
        "comment", "area", "staffIp", "status"
    ];

    updatableFields.forEach(field => {
        if (req.body[field] !== undefined) {
            staff[field] = req.body[field];
        }
    });

    await staff.save();

    successResponse(res, "staff update successfully", staff);

}); 