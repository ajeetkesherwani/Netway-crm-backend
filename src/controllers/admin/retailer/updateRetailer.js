const Retailer = require("../../../models/retailer");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");

exports.updateRetailer = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  if (!id) return next(new AppError("Retailer ID is required", 400));

  // Prevent updating employeeAssociation
  if ("employeeAssociation" in req.body) {
    delete req.body.employeeAssociation;
  }

  // Define which fields can be updated
  const updatableFields = [
    "title", "phoneNo", "email", "resellerName", "district", "houseNo", "pincode", "area",
    "subArea", "mobileNo", "fax", "messengerId", "dob", "balance", "dashboard",
    "panNumber", "resellerCode", "contactPersonNumber", "whatsAppNumber", "address",
    "taluka", "state", "country", "website", "annversaryDate", "latitude", "longitude",
    "gstNo", "contactPersonName", "supportEmail", "nas", "description", "status", "role"
  ];

  // Prepare update data object safely
  const updateData = {};
  for (const field of updatableFields) {
    if (req.body[field] !== undefined) {
      updateData[field] = req.body[field];
    }
  }

  if (Object.keys(updateData).length === 0) {
    return next(new AppError("No valid fields provided for update", 400));
  }

  // Use findByIdAndUpdate to avoid triggering pre('save') hook
  const updatedRetailer = await Retailer.findByIdAndUpdate(
    id,
    { $set: updateData },
    { new: true, runValidators: true }
  );

  if (!updatedRetailer) return next(new AppError("Retailer not found", 404));

  successResponse(res, "Retailer updated successfully", updatedRetailer);
});
