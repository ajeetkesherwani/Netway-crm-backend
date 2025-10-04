const Staff = require("../../../models/Staff");
const AppError = require("../../../utils/AppError");

exports.updateStaff = (async (req, res, next) => {

    const { id } = req.params;

    if (!id) return next(new AppError("staff id is required", 400));

    const staff = await Staff.findById(id);
    if (!staff) return next(new AppError("staff not found", 404));

    const updatableFields = [
       "name", "email", "phoneNo", "password", "address", "bio", "roleId", "logId", "staffName", "salary",
     "comment", "area", "staffIp", "status"
    ];

    updatableFields.forEach(field => {
        if (req.body[field] !== undefined) {
            retailer[field] = req.body[field];
        }
    });

    await retailer.save();

});