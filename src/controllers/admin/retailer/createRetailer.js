const Retailer = require("../../../models/retailer");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");

exports.createRetailer = catchAsync(async (req, res, next) => {
    const {
        title, phoneNo, password, email, district, resellerName, houseNo, pincode, area, subArea,
        mobileNo, fax, messengerId, dob, balance, dashboard, panNumber, resellerCode,
        contactPersonNumber, whatsAppNumber, address, taluka, state, country, website,
        annversaryDate, latitude, longitude, gstNo, contactPersonName, supportEmail,
        nas, description, status, role, employeeAssociation
    } = req.body;


    if (!email) return next(new AppError("email is required", 400));

    let existingRetailer = await Retailer.findOne({ email });

    if (existingRetailer) {
        if (
            !employeeAssociation ||
            !Array.isArray(employeeAssociation) ||
            employeeAssociation.length === 0 ||
            !employeeAssociation[0].employeeUserName ||
            !employeeAssociation[0].password
        ) {
            return next(new AppError("employeeAssociation with username and password is required", 400));
        }

        // Push new employees and save (hook will hash passwords)
        existingRetailer.employeeAssociation.push(...employeeAssociation);
        await existingRetailer.save();

        return successResponse(res, "New employee(s) added successfully", existingRetailer);
    }

    // New retailer creation
    if (!resellerName) return next(new AppError("resellerName is required", 400));
    if (!mobileNo) return next(new AppError("mobileNo is required", 400));
    if (!state) return next(new AppError("state is required", 400));
    if (!role) return next(new AppError("role is required", 400));
    if (!password) return next(new AppError("password is required for new retailer", 400));
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

    // multer files example structure: req.files = { aadhaarCard: [..], panCard: [..], license: [..], other: [..] }
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


    const retailer = new Retailer({
        title, phoneNo, email, password, district, resellerName, houseNo, pincode, area, subArea,
        mobileNo, fax, messengerId, dob, balance, dashboard, panNumber, resellerCode,
        contactPersonNumber, whatsAppNumber, address, taluka, state, country, website,
        annversaryDate, latitude, longitude, gstNo, contactPersonName, supportEmail,
        nas, description, status, role, employeeAssociation, document: documentData,
    });
    console.log(retailer, "reseller");

    await retailer.save();

    successResponse(res, "Retailer created successfully", retailer);
});
