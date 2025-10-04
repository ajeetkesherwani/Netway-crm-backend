const Retailer = require("../../../models/retailer");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");

exports.updateRetailer = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  if (!id) return next(new AppError("Retailer ID is required", 400));


  const retailer = await Retailer.findById(id);
  if (!retailer) return next(new AppError("Retailer not found", 404));

  const updatableFields = [
    "title", "phoneNo", "email", "password", "resellerName", "houseNo", "pincode", "area",
    "subArea", "mobileNo", "fax", "messengerId", "dob", "balance", "dashboard",
    "panNumber", "resellerCode", "contactPersonNumber", "whatsAppNumber", "address",
    "taluka", "state", "country", "website", "annversaryDate", "latitude", "longitude",
    "gstNo", "contactPersonName", "supportEmail", "nas", "description", "status"
  ];

  updatableFields.forEach(field => {
    if (req.body[field] !== undefined) {
      retailer[field] = req.body[field];
    }
  });

  await retailer.save();

  successResponse(res, "Retailer updated successfully", retailer);

});
