// // const User = require("../../../models/user");
// // const catchAsync = require("../../../utils/catchAsync");
// // const AppError = require("../../../utils/AppError");
// // const bcrypt = require("bcryptjs");

// // exports.updateUser = catchAsync(async (req, res, next) => {
// //   const { userId } = req.params;
// //   if (!userId) return next(new AppError("User ID is required", 400));

// //   let user = await User.findById(userId);
// //   if (!user) return next(new AppError("User not found", 404));

// //   console.log("REQ BODY:", req.body);
// //   console.log("FILES:", req.files);

// //   /** ------------------------------
// //    * 1. Parse incoming JSON fields
// //    * ------------------------------*/
// //   const customer = req.body.customer ? JSON.parse(req.body.customer) : null;
// //   const addresses = req.body.addresses ? JSON.parse(req.body.addresses) : null;
// //   const payment = req.body.payment ? JSON.parse(req.body.payment) : null;
// //   const additional = req.body.additional ? JSON.parse(req.body.additional) : null;

// //   /** ------------------------------
// //    * 2. Handle DOCUMENT updates
// //    * ------------------------------*/
// //   const uploadedFiles = req.files?.documents || [];

// //   // Accept both keys: documentTypes or documentTypes[]
// //   let documentTypes = [];

// //   if (req.body.documentTypes) {
// //     documentTypes = Array.isArray(req.body.documentTypes)
// //       ? req.body.documentTypes
// //       : [req.body.documentTypes];
// //   }
// //   if (req.body["documentTypes[]"]) {
// //     const arr = req.body["documentTypes[]"];
// //     documentTypes = Array.isArray(arr) ? arr : [arr];
// //   }

// //   const validDocTypes = [
// //     "ID proof",
// //     "Profile Id",
// //     "Adhar Card",
// //     "Aadhar Card",
// //     "Insurence Paper",
// //     "Signature",
// //     "Other",
// //     "Pan Card",
// //     "Address Proof"
// //   ];

// //   // Map newly uploaded files
// //   const newDocuments = uploadedFiles.map((file, i) => ({
// //     documentType: validDocTypes.includes(documentTypes[i])
// //       ? documentTypes[i]
// //       : "Other",
// //     documentImage: file.filename,
// //   }));

// //   // Merge existing + new documents
// //   if (newDocuments.length > 0) {
// //     user.document = [...user.document, ...newDocuments];
// //     user.markModified("document");
// //   }

// //   /** ------------------------------
// //    * 3. Update General Information
// //    * ------------------------------*/
// //   if (customer) {
// //     for (const key in customer) {
// //       if (customer[key] !== undefined && customer[key] !== "") {
// //         if (key === "password") {
// //           user.generalInformation.plainPassword = customer.password;
// //           user.generalInformation.password = await bcrypt.hash(customer.password, 10);
// //         } else {
// //           user.generalInformation[key] = customer[key];
// //         }
// //       }
// //     }
// //     user.markModified("generalInformation");
// //   }

// //   /** ------------------------------
// //    * 4. Update Address Details
// //    * ------------------------------*/
// //   if (addresses) {
// //     user.addressDetails.billingAddress = {
// //       ...user.addressDetails.billingAddress,
// //       ...addresses.billing,
// //     };

// //     user.addressDetails.permanentAddress = {
// //       ...user.addressDetails.permanentAddress,
// //       ...addresses.permanent,
// //     };

// //     user.addressDetails.installationAddress = {
// //       ...user.addressDetails.installationAddress,
// //       ...addresses.installation,
// //     };

// //     user.addressDetails.area = addresses.billing.area || user.addressDetails.area;

// //     user.markModified("addressDetails");
// //   }

// //   /** ------------------------------
// //    * 5. Update Package Information
// //    * ------------------------------*/
// //   if (customer?.packageDetails) {
// //     user.packageInfomation = {
// //       packageId: customer.packageDetails.packageId || user.packageInfomation.packageId,
// //       packageName: customer.packageDetails.packageName || user.packageInfomation.packageName,
// //       price: customer.packageDetails.packageAmount || user.packageInfomation.price,
// //     };
// //     user.markModified("packageInfomation");
// //   }

// //   /** ------------------------------
// //    * 6. Update Network Information
// //    * ------------------------------*/
// //   if (customer) {
// //     user.networkInformation.networkType = customer.networkType || user.networkInformation.networkType;
// //     user.networkInformation.ipType =
// //       customer.ipType === "Static IP" ? "Static IP" : "Dynamic IP Pool";

// //     user.networkInformation.dynamicIpPool =
// //       customer.dynamicIpPool || user.networkInformation.dynamicIpPool;

// //     if (customer.ipType === "Static IP") {
// //       user.networkInformation.statisIp = { nas: [""], category: "" };
// //     }

// //     user.markModified("networkInformation");
// //   }

// //   /** ------------------------------
// //    * 7. Update Additional Information
// //    * ------------------------------*/
// //   if (additional) {
// //     for (const key in additional) {
// //       if (additional[key] !== undefined) {
// //         user.additionalInformation[key] = additional[key];
// //       }
// //     }

// //     // Convert ekYC boolean to yes/no
// //     if (additional.ekYC !== undefined) {
// //       user.additionalInformation.ekyc = additional.ekYC ? "yes" : "no";
// //     }

// //     user.markModified("additionalInformation");
// //   }

// //   /** ------------------------------
// //    * 8. Save User
// //    * ------------------------------*/
// //   await user.save();

// //   const updatedUser = await User.findById(userId);

// //   return res.status(200).json({
// //     success: true,
// //     message: "User updated successfully",
// //     data: updatedUser,
// //   });
// // });


// // controllers/user/updateUser.js
// const User = require("../../../models/user");
// const catchAsync = require("../../../utils/catchAsync");
// const AppError = require("../../../utils/AppError");
// const bcrypt = require("bcryptjs");

// exports.updateUser = catchAsync(async (req, res, next) => {
//   const { userId } = req.params;
//   if (!userId) return next(new AppError("User ID is required", 400));

//   const user = await User.findById(userId);
//   if (!user) return next(new AppError("User not found", 404));

//   const {
//     customer,
//     addresses,
//     additional,
//     area,
//     existingDocuments = [] // ← Ye frontend se aayega
//   } = req.body;

//   const parsedCustomer = customer ? JSON.parse(customer) : {};
//   const parsedAddresses = addresses ? JSON.parse(addresses) : {};
//   const parsedAdditional = additional ? JSON.parse(additional) : {};

//   // ====================================================================
//   // 1. DOCUMENTS UPDATE (ADD + REMOVE + RETAIN)
//   // ====================================================================
//   const existingFilenames = existingDocuments
//     .map(url => url.split("/").pop())
//     .filter(Boolean);

//   // Keep only those documents jo frontend ne retain kiye
//   user.document = user.document.filter(doc =>
//     existingFilenames.includes(doc.documentImage)
//   );

//   // Add new uploaded documents
//   const uploadedFiles = req.files?.documents || [];
//   const docTypes = Array.isArray(req.body["documentTypes[]"])
//     ? req.body["documentTypes[]"]
//     : req.body["documentTypes[]"] ? [req.body["documentTypes[]"]] : [];

//   uploadedFiles.forEach((file, i) => {
//     user.document.push({
//       documentType: docTypes[i] || "Other",
//       documentImage: file.filename
//     });
//   });

//   if (uploadedFiles.length > 0 || existingDocuments.length > 0) {
//     user.markModified("document");
//   }

//   // ====================================================================
//   // 2. GENERAL INFORMATION (Only sent fields)
//   // ====================================================================
//   if (Object.keys(parsedCustomer).length > 0) {
//     const gen = user.generalInformation;

//     const set = (key, value) => { if (value !== undefined) gen[key] = value; };

//     set("title", parsedCustomer.title);
//     set("name", parsedCustomer.name);
//     set("billingName", parsedCustomer.billingName);
//     set("username", parsedCustomer.username);
//     set("email", parsedCustomer.email);
//     set("phone", parsedCustomer.phone);
//     set("alternatePhone", parsedCustomer.alternatePhone);
//     set("ipactId", parsedCustomer.accountId);
//     set("connectionType", parsedCustomer.connectionType?.toLowerCase());
//     set("selsExecutive", parsedCustomer.selsExecutive);

//     // Installation By - Multiple + Manual
//     if (Array.isArray(parsedCustomer.installationBy)) {
//       gen.installationBy = parsedCustomer.installationBy.filter(Boolean);
//     }
//     if (parsedCustomer.installationByName !== undefined) {
//       gen.installationByName = parsedCustomer.installationByName?.trim() || null;
//     }
//     // Auto clear conflict
//     if (gen.installationBy?.length > 0) gen.installationByName = null;
//     if (gen.installationByName) gen.installationBy = [];

//     set("ipAdress", parsedCustomer.ipAddress);
//     set("ipType", parsedCustomer.ipType);
//     set("serialNo", parsedCustomer.serialNo);
//     set("macId", parsedCustomer.macId);
//     set("serviceOpted", parsedCustomer.serviceOpted);
//     set("stbNo", parsedCustomer.stbNo);
//     set("vcNo", parsedCustomer.vcNo);
//     set("circuitId", parsedCustomer.circuitId);

//     // Password only if sent and not empty
//     if (parsedCustomer.password?.trim()) {
//       gen.plainPassword = parsedCustomer.password;
//       gen.password = await bcrypt.hash(parsedCustomer.password, 10);
//     }

//     user.markModified("generalInformation");
//   }

//   // ====================================================================
//   // 3. ADDRESSES UPDATE
//   // ====================================================================
//   if (Object.keys(parsedAddresses).length > 0) {
//     const updateAddr = (target, source) => {
//       if (source.addressLine1 !== undefined) target.addressine1 = source.addressLine1 || null;
//       if (source.addressLine2 !== undefined) target.addressine2 = source.addressLine2 || null;
//       if (source.city !== undefined) target.city = source.city || null;
//       if (source.state !== undefined) target.state = source.state || null;
//       if (source.pincode !== undefined) target.pincode = source.pincode || null;
//     };

//     if (parsedAddresses.billing) updateAddr(user.addressDetails.billingAddress, parsedAddresses.billing);
//     if (parsedAddresses.permanent) updateAddr(user.addressDetails.permanentAddress, parsedAddresses.permanent);
//     if (parsedAddresses.installation) updateAddr(user.addressDetails.installationAddress, parsedAddresses.installation);

//     if (area !== undefined) user.addressDetails.area = area || null;

//     user.markModified("addressDetails");
//   }

//   // ====================================================================
//   // 4. PACKAGE UPDATE
//   // ====================================================================
//   if (parsedCustomer.packageDetails) {
//     const pkg = parsedCustomer.packageDetails;
//     if (pkg.packageId) user.packageInfomation.packageId = pkg.packageId;
//     if (pkg.packageName) user.packageInfomation.packageName = pkg.packageName;
//     if (pkg.packageAmount) user.packageInfomation.price = pkg.packageAmount;
//     user.markModified("packageInfomation");
//   }

//   // ====================================================================
//   // 5. NETWORK UPDATE
//   // ====================================================================
//   if (parsedCustomer.networkType || parsedCustomer.ipType) {
//     if (parsedCustomer.networkType) {
//       user.networkInformation.networkType = parsedCustomer.networkType;
//     }
//     if (parsedCustomer.ipType) {
//       user.networkInformation.ipType = parsedCustomer.ipType;
//       if (parsedCustomer.ipType === "Static IP") {
//         user.networkInformation.statisIp = { nas: [""], category: "" };
//         user.networkInformation.dynamicIpPool = "";
//       } else if (parsedCustomer.dynamicIpPool !== undefined) {
//         user.networkInformation.dynamicIpPool = parsedCustomer.dynamicIpPool;
//       }
//     }
//     user.markModified("networkInformation");
//   }

//   // ====================================================================
//   // 6. ADDITIONAL & STATUS
//   // ====================================================================
//   if (Object.keys(parsedAdditional).length > 0) {
//     const addl = user.additionalInformation;
//     if (parsedAdditional.dob !== undefined) addl.dob = parsedAdditional.dob;
//     if (parsedAdditional.description !== undefined) addl.description = parsedAdditional.description;
//     if (parsedAdditional.ekYC !== undefined) addl.ekyc = parsedAdditional.ekYC ? "yes" : "no";
//     if (parsedAdditional.status !== undefined) user.status = parsedAdditional.status ? "active" : "Inactive";

//     user.markModified("additionalInformation");
//   }

//   // ====================================================================
//   // 7. SAVE
//   // ====================================================================
//   await user.save({ validateModifiedOnly: true });

//   res.status(200).json({
//     success: true,
//     message: "Customer updated successfully",
//     data: user
//   });
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

  const {
    customer,
    addresses,
    additional,
    area,
    existingDocuments = [] // <-- Documents passed from frontend to retain
  } = req.body;

  // Parse JSON fields safely
  const parsedCustomer = customer ? JSON.parse(customer) : {};
  const parsedAddresses = addresses ? JSON.parse(addresses) : {};
  const parsedAdditional = additional ? JSON.parse(additional) : {};

  // ====================================================================
  // 1. DOCUMENTS UPDATE (ADD + REMOVE + RETAIN)
  // ====================================================================
  const existingFilenames = existingDocuments
    .map(url => url.split("/").pop())
    .filter(Boolean);

  // Keep only those documents that frontend wants to retain
  user.document = user.document.filter(doc =>
    existingFilenames.includes(doc.documentImage)
  );

  // Add new uploaded documents
  const uploadedFiles = req.files?.documents || [];
  const docTypes = Array.isArray(req.body["documentTypes[]"])
    ? req.body["documentTypes[]"]
    : req.body["documentTypes[]"]
    ? [req.body["documentTypes[]"]]
    : [];

  uploadedFiles.forEach((file, i) => {
    user.document.push({
      documentType: docTypes[i] || "Other",
      documentImage: file.filename
    });
  });

  // Mark as modified if new files are added or any document is retained
  if (uploadedFiles.length > 0 || existingDocuments.length > 0) {
    user.markModified("document");
  }

  // ====================================================================
  // 2. GENERAL INFORMATION UPDATE (Only sent fields)
  // ====================================================================
  if (Object.keys(parsedCustomer).length > 0) {
    const gen = user.generalInformation;

    const set = (key, value) => { if (value !== undefined) gen[key] = value; };

    set("title", parsedCustomer.title);
    set("name", parsedCustomer.name);
    set("billingName", parsedCustomer.billingName);
    set("username", parsedCustomer.username);
    set("email", parsedCustomer.email);
    set("phone", parsedCustomer.phone);
    set("alternatePhone", parsedCustomer.alternatePhone);
    set("ipactId", parsedCustomer.accountId);
    set("connectionType", parsedCustomer.connectionType?.toLowerCase());
    set("selsExecutive", parsedCustomer.selsExecutive);

    // Installation By - Multiple + Manual
    if (Array.isArray(parsedCustomer.installationBy)) {
      gen.installationBy = parsedCustomer.installationBy.filter(Boolean);
    }
    if (parsedCustomer.installationByName !== undefined) {
      gen.installationByName = parsedCustomer.installationByName?.trim() || null;
    }
    // Auto clear conflict
    if (gen.installationBy?.length > 0) gen.installationByName = null;
    if (gen.installationByName) gen.installationBy = [];

    set("ipAdress", parsedCustomer.ipAddress);
    set("ipType", parsedCustomer.ipType);
    set("serialNo", parsedCustomer.serialNo);
    set("macId", parsedCustomer.macId);
    set("serviceOpted", parsedCustomer.serviceOpted);
    set("stbNo", parsedCustomer.stbNo);
    set("vcNo", parsedCustomer.vcNo);
    set("circuitId", parsedCustomer.circuitId);

    // Password only if sent and not empty
    if (parsedCustomer.password?.trim()) {
      gen.plainPassword = parsedCustomer.password;
      gen.password = await bcrypt.hash(parsedCustomer.password, 10);
    }

    user.markModified("generalInformation");
  }

  // ====================================================================
  // 3. ADDRESS UPDATE
  // ====================================================================
  if (Object.keys(parsedAddresses).length > 0) {
    const updateAddr = (target, source) => {
      if (source.addressLine1 !== undefined) target.addressine1 = source.addressLine1 || null;
      if (source.addressLine2 !== undefined) target.addressine2 = source.addressLine2 || null;
      if (source.city !== undefined) target.city = source.city || null;
      if (source.state !== undefined) target.state = source.state || null;
      if (source.pincode !== undefined) target.pincode = source.pincode || null;
    };

    if (parsedAddresses.billing) updateAddr(user.addressDetails.billingAddress, parsedAddresses.billing);
    if (parsedAddresses.permanent) updateAddr(user.addressDetails.permanentAddress, parsedAddresses.permanent);
    if (parsedAddresses.installation) updateAddr(user.addressDetails.installationAddress, parsedAddresses.installation);

    if (area !== undefined) user.addressDetails.area = area || null;

    user.markModified("addressDetails");
  }

  // ====================================================================
  // 4. PACKAGE UPDATE
  // ====================================================================
  if (parsedCustomer.packageDetails) {
    const pkg = parsedCustomer.packageDetails;
    if (pkg.packageId) user.packageInfomation.packageId = pkg.packageId;
    if (pkg.packageName) user.packageInfomation.packageName = pkg.packageName;
    if (pkg.packageAmount) user.packageInfomation.price = pkg.packageAmount;
    user.markModified("packageInfomation");
  }

  // ====================================================================
  // 5. NETWORK UPDATE
  // ====================================================================
  if (parsedCustomer.networkType || parsedCustomer.ipType) {
    if (parsedCustomer.networkType) {
      user.networkInformation.networkType = parsedCustomer.networkType;
    }
    if (parsedCustomer.ipType) {
      user.networkInformation.ipType = parsedCustomer.ipType;
      if (parsedCustomer.ipType === "Static IP") {
        user.networkInformation.statisIp = { nas: [""], category: "" };
        user.networkInformation.dynamicIpPool = "";
      } else if (parsedCustomer.dynamicIpPool !== undefined) {
        user.networkInformation.dynamicIpPool = parsedCustomer.dynamicIpPool;
      }
    }
    user.markModified("networkInformation");
  }

  // ====================================================================
  // 6. ADDITIONAL & STATUS UPDATE
  // ====================================================================
  if (Object.keys(parsedAdditional).length > 0) {
    const addl = user.additionalInformation;
    if (parsedAdditional.dob !== undefined) addl.dob = parsedAdditional.dob;
    if (parsedAdditional.description !== undefined) addl.description = parsedAdditional.description;
    if (parsedAdditional.ekYC !== undefined) addl.ekyc = parsedAdditional.ekYC ? "yes" : "no";
    if (parsedAdditional.status !== undefined) user.status = parsedAdditional.status ? "active" : "Inactive";

    user.markModified("additionalInformation");
  }

  // ====================================================================
  // 7. UPDATE CREATED FOR FIELD
  // ====================================================================
  if (parsedCustomer.createdFor) {
    user.generalInformation.createdFor = parsedCustomer.createdFor;
    user.markModified("generalInformation");
  }

  // ====================================================================
  // 7. SAVE
  // ====================================================================
  await user.save({ validateModifiedOnly: true });

  return res.status(200).json({
    success: true,
    message: "Customer updated successfully",
    data: user
  });
});
