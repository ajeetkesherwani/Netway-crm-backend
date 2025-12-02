const Driver = require("../../../models/driver");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");


exports.updateDriverProfile = catchAsync(async (req, res, next) => {

  const { driverId } = req.params;
  if (!driverId) return next(new AppError("driverId is required", 400));

  const {
    firstName, lastName, dob, gender, email, address, mobile, vehicleType,
    location,
    licNumber, accountNumber, ifscCode, bankName
  } = req.body;

  const driver = await Driver.findById(driverId).populate("details").populate("accounts");
  if (!driver) return next(new AppError("Driver not found", 404));

  driver.firstName = firstName || driver.firstName;
  driver.lastName = lastName || driver.lastName;
  driver.dob = dob || driver.dob;
  driver.gender = gender || driver.gender;
  driver.email = email || driver.email;
  driver.address = address || driver.address;
  driver.mobile = mobile || driver.mobile;
  driver.vehicleType = vehicleType || driver.vehicleType;

  if (location.latitude) driver.location.latitude = location.latitude;
  if (location.longitude) driver.location.longitude = location.longitude;

  if (req.files?.frontPhoto?.[0]?.path) {
    driver.frontPhoto = req.files.frontPhoto[0].path;
  }


  const details = driver.details;
  if (details) {
    if (licNumber) details.licence.number = licNumber;

    if (req.files?.licFrontPhoto?.[0]?.path)
      details.licence.frontPhoto = req.files.licFrontPhoto[0].path;

    if (req.files?.licBackPhoto?.[0]?.path)
      details.licence.backPhoto = req.files.licBackPhoto[0].path;

    if (req.files?.aadFrontPhoto?.[0]?.path)
      details.adharCard.frontPhoto = req.files.aadFrontPhoto[0].path;

    if (req.files?.aadBackPhoto?.[0]?.path)
      details.adharCard.backPhoto = req.files.aadBackPhoto[0].path;

    if (req.files?.rcFrontPhoto?.[0]?.path)
      details.rcRegistration.frontPhoto = req.files.rcFrontPhoto[0].path;

    if (req.files?.rcBackPhoto?.[0]?.path)
      details.rcRegistration.backPhoto = req.files.rcBackPhoto[0].path;

    await details.save();
  }

  const accounts = driver.accounts;
  if (accounts) {
    accounts.accountNumber = accountNumber || accounts.accountNumber;
    accounts.ifscCode = ifscCode || accounts.ifscCode;
    accounts.bankName = bankName || accounts.bankName;
    await accounts.save();
  }

  await driver.save();

  const updatedDriver = await Driver.findById(driverId)
    .populate("details")
    .populate("accounts");


  successResponse(res, "Driver profile updated successfully", updatedDriver);
});
