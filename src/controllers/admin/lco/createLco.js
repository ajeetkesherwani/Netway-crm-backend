const Lco = require("../../../models/lco");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");

exports.createLco = catchAsync(async (req, res, next) => {

    const { title, retailerId, roleId, lcoName, password, mobileNo, address, houseNo, taluka, pincode, district,
        area, state, country, subArea, telephone, faxNo, email, messengerId, website, dob, anniversaryDate,
        latitude, longitude, lcoBalance, gst, panNo, dashboard, contactPersonName, contactPersonNumber,
        supportEmail, supportWhatsApp, lcoCode, nas, description, status, employeeAssociation
    } = req.body;


    if (!email) return next(new AppError("email is required", 400));

    //  Check if reseller exists by email
    let existingLco = await Lco.findOne({ email });

    if (existingLco) {
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
            existingLco.employeeAssociation.push(emp);
        }

        await existingLco.save();
        return successResponse(res, "New employee(s) added successfully", existingLco);
    }


    // New reseller creation
    if (!lcoName) return next(new AppError("resellerName is required for new reseller", 400));
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


    const newLco = new Lco({
        title, retailerId, roleId, lcoName, password, mobileNo, address, houseNo, taluka, pincode, district,
        area, state, country, subArea, telephone, faxNo, email, messengerId, website, dob, anniversaryDate,
        latitude, longitude, lcoBalance, gst, panNo, dashboard, contactPersonName, contactPersonNumber,
        supportEmail, supportWhatsApp, lcoCode, nas, description, status, employeeAssociation
    });

    await newLco.save();

    successResponse(res, "new Lco created successfully", newLco);

});