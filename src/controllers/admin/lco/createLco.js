const Lco = require("../../../models/lco");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");

exports.createLco = catchAsync(async (req, res, next) => {
    const {
        title, retailerId, role, lcoName, plainPassword, password, mobileNo, address, houseNo, taluka, pincode, district,
        area, state, country, subArea, telephone, faxNo, email, messengerId, website, dob, anniversaryDate,
        latitude, longitude, lcoBalance, gst, panNo, dashboard, contactPersonName, contactPersonNumber,
        supportEmail, supportWhatsApp, lcoCode, nas, description, status, employeeAssociation
    } = req.body;


    if (!email) return next(new AppError("Email is required", 400));

    // Check if LCO already exists
    let existingLco = await Lco.findOne({ email });

    if (existingLco) {
        if (
            !employeeAssociation ||
            !Array.isArray(employeeAssociation) ||
            employeeAssociation.length === 0 ||
            !employeeAssociation[0].employeeUserName ||
            !employeeAssociation[0].password
        ) {
            return next(new AppError("employeeAssociation with username and password is required", 400));
        }

        // Prevent duplicate usernames
        for (const emp of employeeAssociation) {
            const duplicate = existingLco.employeeAssociation.find(
                (e) => e.employeeUserName === emp.employeeUserName
            );
            if (duplicate) {
                return next(new AppError(`Employee username '${emp.employeeUserName}' already exists`, 400));
            }
        }

        existingLco.employeeAssociation.push(...employeeAssociation);
        await existingLco.save();

        return successResponse(res, "New employee(s) added successfully", existingLco);
    }

    // New LCO creation — must have required fields
    if (!lcoName) return next(new AppError("lcoName is required", 400));
    if (!mobileNo) return next(new AppError("mobileNo is required", 400));
    if (!state) return next(new AppError("state is required", 400));
    if (!role) return next(new AppError("role is required", 400));
    if (!password) return next(new AppError("password is required for new LCO", 400));
    if (
        !employeeAssociation ||
        !Array.isArray(employeeAssociation) ||
        employeeAssociation.length === 0 ||
        !employeeAssociation[0].employeeUserName ||
        !employeeAssociation[0].password
    ) {
        return next(new AppError("employeeAssociation with username and password is required", 400));
    }


    // Handle document uploads
    let documentData = {
        aadhaarCard: [],
        panCard: [],
        license: [],
        other: [],
    };


    if (req.files) {
        if (req.files.aadhaarCard) {
            req.files.aadhaarCard.forEach((file) => {
                documentData.aadhaarCard.push(file.path.replace(/\\/g, "/"));
            });
        }
        if (req.files.panCard) {
            req.files.panCard.forEach((file) => {
                documentData.panCard.push(file.path.replace(/\\/g, "/"));
            });
        }
        if (req.files.license) {
            req.files.license.forEach((file) => {
                documentData.license.push(file.path.replace(/\\/g, "/"));
            });
        }
        if (req.files.other) {
            req.files.other.forEach((file) => {
                documentData.other.push(file.path.replace(/\\/g, "/"));
            });
        }
    }


    const newLco = new Lco({
        title, retailerId, role, lcoName, plainPassword: password, password, mobileNo, address, houseNo, taluka, pincode, district,
        area, state, country, subArea, telephone, faxNo, email, messengerId, website, dob, anniversaryDate,
        latitude, longitude, lcoBalance, gst, panNo, dashboard, contactPersonName, contactPersonNumber,
        supportEmail, supportWhatsApp, lcoCode, nas, description, status, employeeAssociation, document: documentData,
    });

    await newLco.save();
    successResponse(res, "New LCO created successfully with employees", newLco);
});
