const Lco = require("../../../models/lco");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");

exports.createLco = catchAsync(async (req, res, next) => {
    
    let { employeeAssociation } = req.body;

   
    if (employeeAssociation && typeof employeeAssociation === "string") {
        try {
            employeeAssociation = JSON.parse(employeeAssociation);
        } catch (err) {
            return next(new AppError("Invalid employeeAssociation format", 400));
        }
    }

    // Ab baaki sab fields extract karo
    const {
        title, retailerId, role, lcoName, plainPassword, password, mobileNo, address, houseNo, phoneNo, taluka, pincode, district,
        area, state, country, subArea, telephone, faxNo, email, messengerId, website, dob, anniversaryDate,
        latitude, longitude, lcoBalance, gst, panNo, dashboard, contactPersonName, contactPersonNumber,
        supportEmail, supportWhatsApp, lcoCode, nas, description, status, whatsAppNumber
        // employeeAssociation already parsed above
    } = req.body;

    console.log("Final employeeAssociation after parse:", employeeAssociation);

    // Email required
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

    // New LCO creation
    if (!lcoName) return next(new AppError("lcoName is required", 400));
    if (!mobileNo) return next(new AppError("mobileNo is required", 400));
    if (!state) return next(new AppError("state is required", 400));
    if (!role) return next(new AppError("role is required", 400));
    // if (!password) return next(new AppError("password is required for new LCO", 400));

    if (
        !employeeAssociation ||
        !Array.isArray(employeeAssociation) ||
        employeeAssociation.length === 0 ||
        !employeeAssociation[0].employeeUserName ||
        !employeeAssociation[0].password
    ) {
        return next(new AppError("At least one employee with username and password is required", 400));
    }

    // Handle document uploads (same as before)
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

    // Create new LCO
    const newLco = new Lco({
        title, retailerId, role, lcoName, plainPassword: password, password, mobileNo, address,houseNo, taluka, pincode, district,
        area, state, country, subArea,  faxNo, email, messengerId, website, dob, anniversaryDate,whatsAppNumber,
        latitude, longitude, lcoBalance, gst, panNo, dashboard: dashboard || "Lco", contactPersonName, contactPersonNumber,
        supportEmail, supportWhatsApp: whatsAppNumber || "", lcoCode, nas, description, status: status || "active",
        employeeAssociation,
        document: documentData,
    });

    await newLco.save();

    return successResponse(res, "New LCO created successfully with employees", newLco);
});