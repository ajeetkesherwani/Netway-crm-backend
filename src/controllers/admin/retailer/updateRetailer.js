// const Retailer = require("../../../models/retailer");
// const AppError = require("../../../utils/AppError");
// const catchAsync = require("../../../utils/catchAsync");
// const { successResponse } = require("../../../utils/responseHandler");

// exports.updateRetailer = catchAsync(async (req, res, next) => {
//   const { id } = req.params;
//   if (!id) return next(new AppError("Retailer ID is required", 400));

//   // safe body reference (works for both JSON and form-data)
//   const body = req.body || {};

//   // prevent employee updates via this route
//   if (body.employeeAssociation) delete body.employeeAssociation;

//   // allowed fields to update
//   const updatableFields = [
//     "title", "phoneNo", "email", "resellerName", "district", "houseNo", "pincode", "area",
//     "subArea", "mobileNo", "fax", "messengerId", "dob", "balance", "dashboard",
//     "panNumber", "resellerCode", "contactPersonNumber", "whatsAppNumber", "address",
//     "taluka", "state", "country", "website", "annversaryDate", "latitude", "longitude",
//     "gstNo", "contactPersonName", "supportEmail", "nas", "description", "status", "role"
//   ];

//   // build $set with only provided fields
//   const setFields = {};
//   for (const field of updatableFields) {
//     if (body[field] !== undefined && body[field] !== "") {
//       setFields[field] = body[field];
//     }
//   }

//   // build $push for documents if files provided
//   let pushFields = null;
//   if (req.files && req.files.documentImage && req.files.documentImage.length > 0) {
//     const docs = req.files.documentImage.map((file) => ({
//       documentType: body.documentType || "Other",
//       documentImage: file.path.replace(/\\/g, "/"),
//     }));
//     pushFields = { document: { $each: docs } };
//   }

//   // nothing to update?
//   if (Object.keys(setFields).length === 0 && !pushFields) {
//     return next(new AppError("No valid fields provided for update", 400));
//   }

//   // assemble update query
//   const updateQuery = {};
//   if (Object.keys(setFields).length > 0) updateQuery.$set = setFields;
//   if (pushFields) updateQuery.$push = pushFields;

//   // run update
//   const updatedRetailer = await Retailer.findByIdAndUpdate(id, updateQuery, {
//     new: true,
//     runValidators: true,
//   });

//   if (!updatedRetailer) return next(new AppError("Retailer not found", 404));

//   successResponse(res, "Retailer updated successfully", updatedRetailer);
// });


const Retailer = require("../../../models/retailer");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");

exports.updateRetailer = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  if (!id) return next(new AppError("Retailer ID is required", 400));

  const body = req.body || {};

  // Prevent employeeAssociation updates
  if (body.employeeAssociation) delete body.employeeAssociation;

  const updatableFields = [
    "title", "phoneNo", "email", "resellerName", "district", "houseNo", "pincode", "area",
    "subArea", "mobileNo", "fax", "messengerId", "dob", "balance", "dashboard",
    "panNumber", "resellerCode", "contactPersonNumber", "whatsAppNumber", "address",
    "taluka", "state", "country", "website", "annversaryDate", "latitude", "longitude",
    "gstNo", "contactPersonName", "supportEmail", "nas", "description", "status", "role"
  ];

  const setFields = {};
  for (const field of updatableFields) {
    if (body[field] !== undefined && body[field] !== "") {
      setFields[field] = body[field];
    }
  }

  // Handle document uploads (multiple types)
  const documentData = {};
  if (req.files) {
    if (req.files.aadhaarCard) {
      documentData.aadhaarCard = req.files.aadhaarCard.map(f =>
        f.path.replace(/\\/g, "/")
      );
    }
    if (req.files.panCard) {
      documentData.panCard = req.files.panCard.map(f =>
        f.path.replace(/\\/g, "/")
      );
    }
    if (req.files.license) {
      documentData.license = req.files.license.map(f =>
        f.path.replace(/\\/g, "/")
      );
    }
    if (req.files.other) {
      documentData.other = req.files.other.map(f =>
        f.path.replace(/\\/g, "/")
      );
    }
  }

  const updateQuery = {};
  if (Object.keys(setFields).length > 0) updateQuery.$set = setFields;

  // Push only if new docs exist
  if (Object.keys(documentData).length > 0) {
    const pushOps = {};
    for (const key in documentData) {
      pushOps[`document.${key}`] = { $each: documentData[key] };
    }
    updateQuery.$push = pushOps;
  }

  if (Object.keys(updateQuery).length === 0) {
    return next(new AppError("No valid fields provided for update", 400));
  }

  const updatedRetailer = await Retailer.findByIdAndUpdate(id, updateQuery, {
    new: true,
    runValidators: true,
  });

  if (!updatedRetailer) return next(new AppError("Retailer not found", 404));

  successResponse(res, "Retailer updated successfully", updatedRetailer);
});
