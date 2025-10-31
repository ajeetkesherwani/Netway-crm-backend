const Driver = require("../../../models/driver");
const DriverDetail = require("../../../models/driverDetail");
const DriverAccountDetail = require("../../../models/driverAccountDetail");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const validateRequiredFields = require("../../../utils/validateRequiredFields");
const { successResponse } = require("../../../utils/responseHandler");

exports.registerDriver = catchAsync(async (req, res, next) => {
  const {
    firstName, lastName, dob, gender, email, address, mobile, vehicleType,
    licNumber, accountNumber, ifscCode, bankName, location
  } = req.body;


  const requiredFields = [
    { field: firstName, name: "First Name" },
    { field: lastName, name: "Last Name" },
    { field: dob, name: "DOB" },
    { field: gender, name: "Gender" },
    { field: email, name: "Email" },
    { field: address, name: "Address" },
    { field: mobile, name: "Mobile" },
    { field: vehicleType, name: "Vehicle Type" },
    { field: location?.latitude, name: "Latitude" },
    { field: location?.longitude, name: "Longitude" },
    { field: licNumber, name: "License Number" },
    { field: accountNumber, name: "Account Number" },
    { field: ifscCode, name: "IFSC Code" },
    { field: bankName, name: "Bank Name" },
  ];

  let error = validateRequiredFields(requiredFields);
  if (error) return next(error);

  const driverExists = await Driver.findOne({ mobile });
  if (driverExists) return next(new AppError("Driver already registered", 400));

  const driverDetail = {
    rcRegistration: {
      frontPhoto: req.files?.rcFrontPhoto?.[0]?.path,
      backPhoto: req.files?.rcBackPhoto?.[0]?.path,
    },
    licence: {
      number: licNumber,
      frontPhoto: req.files?.licFrontPhoto?.[0]?.path,
      backPhoto: req.files?.licBackPhoto?.[0]?.path,
    },
    adharCard: {
      frontPhoto: req.files?.aadFrontPhoto?.[0]?.path,
      backPhoto: req.files?.aadBackPhoto?.[0]?.path,
    },
  };

  const requiredFiles = [
    { field: driverDetail.rcRegistration.frontPhoto, name: "RC Front Photo" },
    { field: driverDetail.rcRegistration.backPhoto, name: "RC Back Photo" },
    { field: driverDetail.licence.frontPhoto, name: "License Front Photo" },
    { field: driverDetail.licence.backPhoto, name: "License Back Photo" },
    { field: driverDetail.adharCard.frontPhoto, name: "Aadhar Front Photo" },
    { field: driverDetail.adharCard.backPhoto, name: "Aadhar Back Photo" },
  ];
  error = validateRequiredFields(requiredFiles);
  if (error) return next(error);

  const driverAccountDetail = { accountNumber, ifscCode, bankName };

  const detailDoc = await DriverDetail.create(driverDetail);
  const accountDoc = await DriverAccountDetail.create(driverAccountDetail);

  const driverDoc = await Driver.create({
    firstName,
    lastName,
    dob,
    gender,
    email,
    address,
    mobile,
    vehicleType,
    frontPhoto: req.files?.frontPhoto?.[0]?.path,
    details: detailDoc._id,
    accounts: accountDoc._id,
    location
  });

  const populatedDriver = await Driver.findById(driverDoc._id)
    .populate("details")
    .populate("accounts");

  successResponse(res, "Driver registered successfully", populatedDriver);
});
