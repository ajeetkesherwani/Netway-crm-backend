const Staff = require("../../../models/Staff");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");

exports.updateStaff = catchAsync(async (req, res, next) => {

    const { id } = req.params;

    if (!id) return next(new AppError("staff id is required", 400));

    const staff = await Staff.findById(id);
    if (!staff) return next(new AppError("staff not found", 404));

    console.log("Updating staff with data:", req.body);
    // fields allowed to update (matching createStaff)
    const updatableFields = [
        "name",
        "email",
        "phoneNo",
        "address",
        "bio",
        "role",  
        "logId",
        "staffName",
        "salary",
        "comment",
        "area",
        "staffIp",
        "status"
    ];

    updatableFields.forEach(field => {
        if (req.body[field] !== undefined) {
            staff[field] = req.body[field];

            // maintain consistency with createStaff (store plainPassword)
            if (field === "password") {
                staff.plainPassword = req.body.password;
            }
        }
    });

    await staff.save();

    successResponse(res, "Staff updated successfully", staff);
});