const Retailer = require("../../../models/retailer");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");
const bcrypt = require("bcryptjs");

exports.createRetailer = catchAsync(async (req, res, next) => {
    const {
        title, phoneNo, password, email, resellerName, houseNo, pincode, area, subArea,
        mobileNo, fax, messengerId, dob, balance, dashboard, panNumber, resellerCode,
        contactPersonNumber, whatsAppNumber, address, taluka, state, country, website,
        annversaryDate, latitude, longitude, gstNo, contactPersonName, supportEmail,
        nas, description, status, role, employeeAssociation
    } = req.body;

    if (!email) return next(new AppError("email is required", 400));

    //  Check if reseller exists by email
    let existingRetailer = await Retailer.findOne({ email });

    if (existingRetailer) {
        // Existing reseller: only allow employeeAssociation data
        if (
            !employeeAssociation ||
            !Array.isArray(employeeAssociation) ||
            employeeAssociation.length === 0 ||
            !employeeAssociation[0].employeeUserName ||
            !employeeAssociation[0].password
        ) {
            return next(new AppError("employeeAssociation with username and password is required", 400));
        }

        for (let emp of employeeAssociation) {
            emp.password = await bcrypt.hash(emp.password, 10);
            existingRetailer.employeeAssociation.push(emp);
        }

        await existingRetailer.save();
        return successResponse(res, "New employee(s) added successfully", existingRetailer);
    }

    // New reseller creation
    if (!resellerName) return next(new AppError("resellerName is required for new reseller", 400));
    if (!mobileNo) return next(new AppError("mobileNo is required for new reseller", 400));
    if (!state) return next(new AppError("state is required for new reseller", 400));
    if (!roleId) return next(new AppError("roleId is required for new reseller", 400));
    if (!password) return next(new AppError("password is required for new reseller", 400));
    if (
        !employeeAssociation ||
        !Array.isArray(employeeAssociation) ||
        employeeAssociation.length === 0 ||
        !employeeAssociation[0].employeeUserName ||
        !employeeAssociation[0].password
    ) {
        return next(new AppError("employeeAssociation with username and password is required", 400));
    }

    // Hash password for each employee
    for (let emp of employeeAssociation) {
        emp.password = await bcrypt.hash(emp.password, 10);
    }

    const retailer = new Retailer({
        title, phoneNo, email, password, resellerName, houseNo, pincode, area, subArea,
        mobileNo, fax, messengerId, dob, balance, dashboard, panNumber, resellerCode,
        contactPersonNumber, whatsAppNumber, address, taluka, state, country, website,
        annversaryDate, latitude, longitude, gstNo, contactPersonName, supportEmail,
        nas, description, status, role, employeeAssociation
    });

    await retailer.save();
    successResponse(res, "Retailer created successfully", retailer);
});
