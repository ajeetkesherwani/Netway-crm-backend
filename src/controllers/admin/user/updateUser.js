// const User = require("../../../models/user");
// const catchAsync = require("../../../utils/catchAsync");
// const AppError = require("../../../utils/AppError");
// const { successResponse } = require("../../../utils/responseHandler");
// const bcrypt = require("bcryptjs");

// exports.updateUser = catchAsync(async (req, res, next) => {
//     const { userId } = req.params;
//     if (!userId) return next(new AppError("User ID is required", 400));

//     const user = await User.findById(userId);
//     if (!user) return next(new AppError("User not found", 404));

//     // ✅ Update generalInformation
//     if (req.body.generalInformation) {
//         const generalInfo = req.body.generalInformation;

//         for (const key in generalInfo) {
//             if (generalInfo[key] !== undefined) {
//                 if (key === "password") {
//                     user.generalInformation.plainPassword = generalInfo.password;
//                     user.generalInformation.password = await bcrypt.hash(
//                         generalInfo.password,
//                         10
//                     );
//                 } else if (key === "createdFor") {
//                     if (generalInfo.createdFor.id && generalInfo.createdFor.type) {
//                         user.generalInformation.createdFor = {
//                             id: generalInfo.createdFor.id,
//                             type: generalInfo.createdFor.type,
//                         };
//                     }
//                 } else {
//                     user.generalInformation[key] = generalInfo[key];
//                 }
//             }
//         }

//         user.markModified("generalInformation");
//     }

//     // ✅ Update networkInformation
//     if (req.body.networkInformation) {
//         const netInfo = req.body.networkInformation;
//         for (const key in netInfo) {
//             if (netInfo[key] !== undefined) {
//                 user.networkInformation[key] = netInfo[key];
//             }
//         }
//         user.markModified("networkInformation");
//     }

//     // ✅ Update additionalInformation
//     if (req.body.additionalInformation) {
//         const addInfo = req.body.additionalInformation;
//         for (const key in addInfo) {
//             if (addInfo[key] !== undefined) {
//                 user.additionalInformation[key] = addInfo[key];
//             }
//         }
//         user.markModified("additionalInformation");
//     }

//     // ✅ Update document
//     if (req.body.document) {
//         const docInfo = req.body.document;
//         for (const key in docInfo) {
//             if (docInfo[key] !== undefined) {
//                 user.document[key] = docInfo[key];
//             }
//         }
//         user.markModified("document");
//     }

//     // ✅ Save and return updated user
//     await user.save();
//     const updatedUser = await User.findById(userId);

//     successResponse(res, "User updated successfully", updatedUser);
// });


const User = require("../../../models/user");
const catchAsync = require("../../../utils/catchAsync");
const AppError = require("../../../utils/AppError");
const bcrypt = require("bcryptjs");

exports.updateUser = catchAsync(async (req, res, next) => {
  const { userId } = req.params;
  if (!userId) return next(new AppError("User ID is required", 400));

  let user = await User.findById(userId);
  if (!user) return next(new AppError("User not found", 404));

  console.log("REQ BODY:", req.body);
  console.log("FILES:", req.files);

  /** ------------------------------
   * 1. Parse incoming JSON fields
   * ------------------------------*/
  const customer = req.body.customer ? JSON.parse(req.body.customer) : null;
  const addresses = req.body.addresses ? JSON.parse(req.body.addresses) : null;
  const payment = req.body.payment ? JSON.parse(req.body.payment) : null;
  const additional = req.body.additional ? JSON.parse(req.body.additional) : null;

  /** ------------------------------
   * 2. Handle DOCUMENT updates
   * ------------------------------*/
  const uploadedFiles = req.files?.documents || [];

  // Accept both keys: documentTypes or documentTypes[]
  let documentTypes = [];

  if (req.body.documentTypes) {
    documentTypes = Array.isArray(req.body.documentTypes)
      ? req.body.documentTypes
      : [req.body.documentTypes];
  }
  if (req.body["documentTypes[]"]) {
    const arr = req.body["documentTypes[]"];
    documentTypes = Array.isArray(arr) ? arr : [arr];
  }

  const validDocTypes = [
    "ID proof",
    "Profile Id",
    "Adhar Card",
    "Aadhar Card",
    "Insurence Paper",
    "Signature",
    "Other",
    "Pan Card",
    "Address Proof"
  ];

  // Map newly uploaded files
  const newDocuments = uploadedFiles.map((file, i) => ({
    documentType: validDocTypes.includes(documentTypes[i])
      ? documentTypes[i]
      : "Other",
    documentImage: file.filename,
  }));

  // Merge existing + new documents
  if (newDocuments.length > 0) {
    user.document = [...user.document, ...newDocuments];
    user.markModified("document");
  }

  /** ------------------------------
   * 3. Update General Information
   * ------------------------------*/
  if (customer) {
    for (const key in customer) {
      if (customer[key] !== undefined && customer[key] !== "") {
        if (key === "password") {
          user.generalInformation.plainPassword = customer.password;
          user.generalInformation.password = await bcrypt.hash(customer.password, 10);
        } else {
          user.generalInformation[key] = customer[key];
        }
      }
    }
    user.markModified("generalInformation");
  }

  /** ------------------------------
   * 4. Update Address Details
   * ------------------------------*/
  if (addresses) {
    user.addressDetails.billingAddress = {
      ...user.addressDetails.billingAddress,
      ...addresses.billing,
    };

    user.addressDetails.permanentAddress = {
      ...user.addressDetails.permanentAddress,
      ...addresses.permanent,
    };

    user.addressDetails.installationAddress = {
      ...user.addressDetails.installationAddress,
      ...addresses.installation,
    };

    user.addressDetails.area = addresses.billing.area || user.addressDetails.area;

    user.markModified("addressDetails");
  }

  /** ------------------------------
   * 5. Update Package Information
   * ------------------------------*/
  if (customer?.packageDetails) {
    user.packageInfomation = {
      packageId: customer.packageDetails.packageId || user.packageInfomation.packageId,
      packageName: customer.packageDetails.packageName || user.packageInfomation.packageName,
      price: customer.packageDetails.packageAmount || user.packageInfomation.price,
    };
    user.markModified("packageInfomation");
  }

  /** ------------------------------
   * 6. Update Network Information
   * ------------------------------*/
  if (customer) {
    user.networkInformation.networkType = customer.networkType || user.networkInformation.networkType;
    user.networkInformation.ipType =
      customer.ipType === "Static IP" ? "Static IP" : "Dynamic IP Pool";

    user.networkInformation.dynamicIpPool =
      customer.dynamicIpPool || user.networkInformation.dynamicIpPool;

    if (customer.ipType === "Static IP") {
      user.networkInformation.statisIp = { nas: [""], category: "" };
    }

    user.markModified("networkInformation");
  }

  /** ------------------------------
   * 7. Update Additional Information
   * ------------------------------*/
  if (additional) {
    for (const key in additional) {
      if (additional[key] !== undefined) {
        user.additionalInformation[key] = additional[key];
      }
    }

    // Convert ekYC boolean to yes/no
    if (additional.ekYC !== undefined) {
      user.additionalInformation.ekyc = additional.ekYC ? "yes" : "no";
    }

    user.markModified("additionalInformation");
  }

  /** ------------------------------
   * 8. Save User
   * ------------------------------*/
  await user.save();

  const updatedUser = await User.findById(userId);

  return res.status(200).json({
    success: true,
    message: "User updated successfully",
    data: updatedUser,
  });
});
