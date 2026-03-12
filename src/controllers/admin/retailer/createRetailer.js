const Retailer = require("../../../models/retailer");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");
const createResellerWalletHistory = require("../../../utils/createResellerWalletHistory");
const { sendTemplateSMS } = require("../../../utils/smsService");

exports.createRetailer = catchAsync(async (req, res, next) => {
    const {
        title, phoneNo, password, email, district, resellerName, houseNo, pincode, area, subArea,
        mobileNo, fax, messengerId, dob, balance, dashboard, panNumber, resellerCode,
        contactPersonNumber, whatsAppNumber, address, taluka, state, country, website,
        annversaryDate, latitude, longitude, gstNo, contactPersonName, supportEmail,
        nas, description, status, role
    } = req.body;

    let { employeeAssociation } = req.body;


    if (!email) return next(new AppError("email is required", 400));

    let existingRetailer = await Retailer.findOne({ email });

    // console.log("employeeAssociation", JSON.parse(employeeAssociation));
    employeeAssociation = JSON.parse(employeeAssociation);
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
    // if (!password) return next(new AppError("password is required for new retailer", 400));
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
        mobileNo, fax, messengerId, dob, walletBalance:balance, dashboard, panNumber, resellerCode,
        contactPersonNumber, whatsAppNumber, address, taluka, state, country, website,
        annversaryDate, latitude, longitude, gstNo, contactPersonName, supportEmail,
        nas, description, status, role, employeeAssociation, document: documentData,
    });

    await retailer.save();

    // Create reseller wallet history for the new retailer
    await createResellerWalletHistory({
        reseller: retailer._id,
        amount: balance || 0,
        paymentDate: new Date(),
        mode: "Online", // Assuming initial balance is added through an online transaction, adjust as needed
        createdBy: req.user.role, // Assuming req.user contains the authenticated user
        createdById: req.user._id,
        openingBalance: 0,
        closingBalance: balance || 0,
        remark: "Initial wallet balance for new retailer"
    });

    await sendTemplateSMS(
        mobileNo,
        "Your_account_created",
        {
        plan: "",           
        username: employeeAssociation[0].employeeUserName,    
        password: employeeAssociation[0].password
        }
    );   

    successResponse(res, "Retailer created successfully", retailer);
});
