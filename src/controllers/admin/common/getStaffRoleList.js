const Role = require("../../../models/role");
const Staff = require("../../../models/Staff");
const Retailer = require("../../../models/retailer");
const Lco = require("../../../models/lco");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");

exports.getStaffRoleList = catchAsync(async (req, res, next) => {
    const user = req.user;
    const StaffData = '';

    switch (user.role) {
        // -------------------------------------------------
        // 1️⃣ ADMIN → Return Staff list (Staff Schema)
        // -------------------------------------------------
        case "Admin":
            roles = await Staff.find({}, "_id staffName").lean(); 
            // console.log("Staff Roles for Admin:", roles);
            break;

        // -------------------------------------------------
        // 2️⃣ RESELLER → Only Operator type inside Retailer.employeeAssociation
        // -------------------------------------------------
        case "Reseller":
            const reseller = await Retailer.findById(user._id).lean();
            if (!reseller) return next(new AppError("Reseller not found", 404));

            roles = reseller.employeeAssociation
                .filter(emp => emp.type === "Operator")
                .map(emp => ({
                    _id: emp._id,
                    staffName: emp.employeeName
                }));
            break;

        // -------------------------------------------------
        // 3️⃣ LCO → Only Operator type inside Lco.employeeAssociation
        // -------------------------------------------------
        case "Lco":
            const lco = await Lco.findById(user._id).lean();
            if (!lco) return next(new AppError("LCO not found", 404));

            roles = lco.employeeAssociation
                .filter(emp => emp.type === "Operator")
                .map(emp => ({
                    _id: emp._id,
                    staffName: emp.employeeName
                }));
            break;

        default:
            return next(new AppError("You do not have permission to access staff roles.", 403));
    }



    // const roles = await Role.find({
    //     roleName: {
    //         $not: {
    //             $regex: /^(admin|Reseller|Lco|Retailer|Manager|Operator)$/i,
    //         },
    //     },
    // }).select("roleName");

    // if (!roles || roles.length === 0) {
    //     return next(new AppError("No staff roles found.", 404));
    // }


    // console.log("Fetched Roles:", roles);

    successResponse(res, "Staff roles fetched successfully", roles);

});
