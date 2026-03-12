// const User = require("../../../models/user");
// const catchAsync = require("../../../utils/catchAsync");
// const AppError = require("../../../utils/AppError");

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
//     subZone
//   } = req.body;

//   const parsedCustomer = customer ? JSON.parse(customer) : {};
//   const parsedAddresses = addresses ? JSON.parse(addresses) : {};
//   const parsedAdditional = additional ? JSON.parse(additional) : {};

//   /* =========================================================
//      🔥 DOCUMENT UPDATE - ENTERPRISE LEVEL
//   ========================================================== */

//   const hasDocumentUpdate =
//     req.files?.documents !== undefined ||
//     req.body["documentTypes[]"] !== undefined ||
//     req.body.documentTypes !== undefined ||
//     req.body.existingDocuments !== undefined;

//   if (hasDocumentUpdate) {
//     const uploadedFiles = req.files?.documents || [];

//     const validDocTypes = [
//       "Address Proof",
//       "Profile Photo",
//       "Addhar Card",
//       "Passport",
//       "Signature",
//       "Pan Card",
//       "Driving Licence",
//       "GST",
//       "Caf Form",
//       "Other",
//     ];

//     /* ----------------------------
//        1️⃣ Parse Document Types
//     ---------------------------- */
//     let documentTypes = [];

//     if (req.body["documentTypes[]"]) {
//       const arr = req.body["documentTypes[]"];
//       documentTypes = Array.isArray(arr) ? arr : [arr];
//     }

//     if (req.body.documentTypes) {
//       const val = req.body.documentTypes;
//       documentTypes = [
//         ...documentTypes,
//         ...(Array.isArray(val) ? val : [val]),
//       ];
//     }

//     console.log("documentTypes=========>>", documentTypes);
//     if (!documentTypes.length && uploadedFiles.length > 0) {
//       for (let i = 0; i < uploadedFiles.length; i++) {
//         const key = `documentTypes[${i}]`;
//         if (req.body[key]) documentTypes.push(req.body[key]);
//       }
//     }

//     documentTypes = documentTypes.map(t => t?.trim()).filter(Boolean);

//     /* ----------------------------
//        2️⃣ Parse Existing Files To Keep
//     ---------------------------- */

//     let filesToKeep = [];

//     if (req.body.existingDocuments) {
//       try {
//         const parsed = JSON.parse(req.body.existingDocuments);
//         filesToKeep = Array.isArray(parsed) ? parsed : [];
//       } catch {
//         filesToKeep = Array.isArray(req.body.existingDocuments)
//           ? req.body.existingDocuments
//           : [];
//       }
//     }

//     filesToKeep = filesToKeep
//       .map(f => (typeof f === "string" ? f.split("/").pop() : null))
//       .filter(Boolean);

//     /* ----------------------------
//        3️⃣ Retain Existing Docs
//     ---------------------------- */

//     let updatedDocuments = [];

//     (user.document || []).forEach(doc => {

//       // MULTIPLE IMAGE TYPE
//       if (doc.documentType === "Other") {

//         const remainingImages = (doc.documentImage || []).filter(img =>
//           filesToKeep.includes(img.split("/").pop())
//         );

//         if (remainingImages.length > 0) {
//           updatedDocuments.push({
//             documentType: "Other",
//             documentImage: remainingImages
//           });
//         }

//       } else {

//         const filename =
//           typeof doc.documentImage === "string" && doc.documentImage
//             ? doc.documentImage.split("/").pop()
//             : null;

//         if (filename && filesToKeep.includes(filename)) {
//           updatedDocuments.push(doc);
//         }

//       }

//     });

//     /* ----------------------------
//        4️⃣ Merge New Uploads
//     ---------------------------- */

//     uploadedFiles.forEach((file, index) => {

//       let type = documentTypes[index] || "Other";

//       if (!validDocTypes.includes(type)) {
//         type = "Other";
//       }

//       let existingDoc = updatedDocuments.find(
//         d => d.documentType === type
//       );

//       if (!existingDoc) {
//         existingDoc = {
//           documentType: type,
//           documentImage: type === "Other" ? [] : null
//         };
//         updatedDocuments.push(existingDoc);
//       }

//       if (type === "Other") {

//         const current = Array.isArray(existingDoc.documentImage)
//           ? existingDoc.documentImage
//           : [];

//         existingDoc.documentImage = [...current, file.path];

//       } else {

//         // Replace existing single-type doc
//         existingDoc.documentImage = file.path;

//       }

//     });

//     /* ----------------------------
//        5️⃣ Remove Empty Types
//     ---------------------------- */

//     updatedDocuments = updatedDocuments.filter(doc => {

//       if (doc.documentType === "Other") {
//         return (
//           Array.isArray(doc.documentImage) &&
//           doc.documentImage.length > 0
//         );
//       }

//       return !!doc.documentImage;

//     });

//     user.document = updatedDocuments;
//     user.markModified("document");
//   }

//   /* =========================================================
//      🔥 ADDRESS UPDATE (FIXED TYPO)
//   ========================================================== */

//   if (Object.keys(parsedAddresses).length > 0) {

//     const updateAddr = (target, source) => {
//       if (!target) return;

//       if (source.addressLine1 !== undefined)
//         target.addressine1 = source.addressLine1 || "";

//       if (source.addressLine2 !== undefined)
//         target.addressine2 = source.addressLine2 || "";

//       if (source.city !== undefined)
//         target.city = source.city || "";

//       if (source.state !== undefined)
//         target.state = source.state || "";

//       if (source.pincode !== undefined)
//         target.pincode = source.pincode || "";
//     };

//     if (parsedAddresses.billing)
//       updateAddr(user.addressDetails.billingAddress, parsedAddresses.billing);

//     if (parsedAddresses.permanent)
//       updateAddr(user.addressDetails.permanentAddress, parsedAddresses.permanent);

//     if (parsedAddresses.installation)
//       updateAddr(user.addressDetails.installationAddress, parsedAddresses.installation);

//     if (area !== undefined)
//       user.addressDetails.area = area || null;

//     if (subZone !== undefined)
//       user.addressDetails.subZone = subZone || null;

//     if (req.body.customArea !== undefined)
//       user.addressDetails.customArea = req.body.customArea || "";

//     user.markModified("addressDetails");
//   }

//   /* =========================================================
//      PACKAGE UPDATE
//   ========================================================== */

//   if (parsedCustomer.packageDetails) {
//     const pkg = parsedCustomer.packageDetails;

//     user.packageInfomation = {
//       ...user.packageInfomation,
//       packageId: pkg.packageId || user.packageInfomation.packageId,
//       packageName: pkg.packageName || user.packageInfomation.packageName,
//       price: pkg.packageAmount || user.packageInfomation.price,
//     };

//     user.markModified("packageInfomation");
//   }

//   /* =========================================================
//      NETWORK UPDATE
//   ========================================================== */

//   if (parsedCustomer.networkType || parsedCustomer.ipType) {

//     if (parsedCustomer.networkType)
//       user.networkInformation.networkType = parsedCustomer.networkType;

//     if (parsedCustomer.ipType) {

//       user.networkInformation.ipType = parsedCustomer.ipType;

//       if (parsedCustomer.ipType === "Static IP") {
//         user.networkInformation.statisIp = { nas: [""], category: "" };
//         user.networkInformation.dynamicIpPool = "";
//       } else if (parsedCustomer.dynamicIpPool !== undefined) {
//         user.networkInformation.dynamicIpPool = parsedCustomer.dynamicIpPool;
//       }
//     }

//     if (parsedCustomer.alternateMobile) {
//       user.generalInformation.alternatePhone = parsedCustomer.alternateMobile;
//     }

//     user.generalInformation.ipactId = parsedCustomer.ipactId;
//     user.markModified("networkInformation");
//   }

//   /* =========================================================
//      ADDITIONAL INFO
//   ========================================================== */

//   if (Object.keys(parsedAdditional).length > 0) {

//     const addl = user.additionalInformation;

//     if (parsedAdditional.dob !== undefined)
//       addl.dob = parsedAdditional.dob;

//     if (parsedAdditional.description !== undefined)
//       addl.description = parsedAdditional.description;

//     if (parsedAdditional.ekYC !== undefined)
//       addl.ekyc = parsedAdditional.ekYC ? "yes" : "no";

//     if (parsedAdditional.status !== undefined)
//       user.status = parsedAdditional.status ? "active" : "Inactive";

//     user.markModified("additionalInformation");
//   }

//   /* =========================================================
//      SAVE
//   ========================================================== */

//   await user.save({ validateModifiedOnly: true });

//   return res.status(200).json({
//     success: true,
//     message: "Customer updated successfully",
//     data: user,
//   });
// });
const User = require("../../../models/user");
const catchAsync = require("../../../utils/catchAsync");
const AppError = require("../../../utils/AppError");

exports.updateUser = catchAsync(async (req, res, next) => {

  const { userId } = req.params;

  if (!userId)
    return next(new AppError("User ID is required", 400));

  const user = await User.findById(userId);

  if (!user)
    return next(new AppError("User not found", 404));


  /* =========================================================
     PARSE REQUEST BODY
  ========================================================== */

  const {
    customer,
    addresses,
    additional,
    area,
    subZone
  } = req.body;

  const parsedCustomer = customer ? JSON.parse(customer) : {};
  const parsedAddresses = addresses ? JSON.parse(addresses) : {};
  const parsedAdditional = additional ? JSON.parse(additional) : {};

  console.log("parsedCustomer", parsedCustomer);
  /* =========================================================
     DOCUMENT UPDATE (SAFE VERSION)
  ========================================================== */

  const uploadedFiles = req.files?.documents || [];

  let documentTypes = [];

  if (req.body["documentTypes[]"]) {
    const arr = req.body["documentTypes[]"];
    documentTypes = Array.isArray(arr) ? arr : [arr];
  }

  if (req.body.documentTypes) {
    const arr = req.body.documentTypes;
    documentTypes.push(...(Array.isArray(arr) ? arr : [arr]));
  }

  documentTypes = documentTypes.map(t => t?.trim()).filter(Boolean);


  let filesToKeep = [];

  if (req.body.existingDocuments !== undefined) {

    try {

      const parsed = JSON.parse(req.body.existingDocuments);

      filesToKeep = Array.isArray(parsed)
        ? parsed
        : [];

    } catch {

      filesToKeep = Array.isArray(req.body.existingDocuments)
        ? req.body.existingDocuments
        : [];

    }

  }

  filesToKeep = filesToKeep
    .map(f => typeof f === "string" ? f.split("/").pop() : null)
    .filter(Boolean);


  const shouldUpdateDocuments =
    uploadedFiles.length > 0 ||
    filesToKeep.length > 0 ||
    documentTypes.length > 0;


  if (shouldUpdateDocuments) {

    const validDocTypes = [
      "Address Proof",
      "Profile Photo",
      "Addhar Card",
      "Passport",
      "Signature",
      "Pan Card",
      "Driving Licence",
      "GST",
      "Caf Form",
      "Other",
    ];

    let updatedDocuments = [];

    /* KEEP EXISTING DOCUMENTS */

    if (filesToKeep.length > 0) {

      (user.document || []).forEach(doc => {

        if (doc.documentType === "Other") {

          const remainingImages = doc.documentImage.filter(img =>
            filesToKeep.includes(img.split("/").pop())
          );

          if (remainingImages.length > 0) {

            updatedDocuments.push({
              documentType: "Other",
              documentImage: remainingImages
            });

          }

        } else {

          const filename = doc.documentImage?.[0]?.split("/").pop();

          if (filename && filesToKeep.includes(filename)) {

            updatedDocuments.push(doc);

          }

        }

      });

    } else {

      updatedDocuments = [...user.document];

    }


    /* ADD / REPLACE NEW FILES */

    uploadedFiles.forEach((file, index) => {

      let type = documentTypes[index] || "Other";

      if (!validDocTypes.includes(type))
        type = "Other";


      let existingDoc = updatedDocuments.find(
        d => d.documentType === type
      );


      if (!existingDoc) {

        existingDoc = {
          documentType: type,
          documentImage: []
        };

        updatedDocuments.push(existingDoc);

      }


      if (type === "Other") {

        existingDoc.documentImage.push(file.path);

      } else {

        existingDoc.documentImage = [file.path];

      }

    });


    user.document = updatedDocuments;

    user.markModified("document");

  }


  /* =========================================================
     ADDRESS UPDATE
  ========================================================== */

  if (Object.keys(parsedAddresses).length > 0) {

    const updateAddr = (target, source) => {

      if (!target) return;

      if (source.addressLine1 !== undefined)
        target.addressine1 = source.addressLine1 || "";

      if (source.addressLine2 !== undefined)
        target.addressine2 = source.addressLine2 || "";

      if (source.city !== undefined)
        target.city = source.city || "";

      if (source.state !== undefined)
        target.state = source.state || "";

      if (source.pincode !== undefined)
        target.pincode = source.pincode || "";

    };

    if (parsedAddresses.billing)
      updateAddr(user.addressDetails.billingAddress, parsedAddresses.billing);

    if (parsedAddresses.permanent)
      updateAddr(user.addressDetails.permanentAddress, parsedAddresses.permanent);

    if (parsedAddresses.installation)
      updateAddr(user.addressDetails.installationAddress, parsedAddresses.installation);


    if (area !== undefined)
      user.addressDetails.area = area || null;

    if (subZone !== undefined)
      user.addressDetails.subZone = subZone || null;

    if (req.body.customArea !== undefined)
      user.addressDetails.customArea = req.body.customArea || "";


    user.markModified("addressDetails");

  }


  /* =========================================================
     PACKAGE UPDATE
  ========================================================== */

  if (parsedCustomer.packageDetails) {

    const pkg = parsedCustomer.packageDetails;

    user.packageInfomation = {
      ...user.packageInfomation,
      packageId: pkg.packageId || user.packageInfomation.packageId,
      packageName: pkg.packageName || user.packageInfomation.packageName,
      price: pkg.packageAmount || user.packageInfomation.price,
    };

    user.markModified("packageInfomation");

  }


  /* =========================================================
     NETWORK UPDATE
  ========================================================== */

  if (parsedCustomer.networkType || parsedCustomer.ipType) {

    if (parsedCustomer.networkType)
      user.networkInformation.networkType = parsedCustomer.networkType;

    if (parsedCustomer.ipType) {

      user.networkInformation.ipType = parsedCustomer.ipType;

      if (parsedCustomer.ipType === "Static IP") {

        user.networkInformation.statisIp = {
          nas: [""],
          category: ""
        };

        user.networkInformation.dynamicIpPool = "";

      }
      else if (parsedCustomer.dynamicIpPool !== undefined) {

        user.networkInformation.dynamicIpPool =
          parsedCustomer.dynamicIpPool;

      }

    }

    if (parsedCustomer.alternateMobile)
      user.generalInformation.alternatePhone =
        parsedCustomer.alternateMobile;


    user.generalInformation.ipactId =
      parsedCustomer.ipactId;


    user.markModified("networkInformation");

  }


  /* =========================================================
     ADDITIONAL INFO UPDATE
  ========================================================== */

  if (Object.keys(parsedAdditional).length > 0) {

    const addl = user.additionalInformation;

    if (parsedAdditional.dob !== undefined)
      addl.dob = parsedAdditional.dob;

    if (parsedAdditional.description !== undefined)
      addl.description = parsedAdditional.description;

    if (parsedAdditional.ekYC !== undefined)
      addl.ekyc = parsedAdditional.ekYC ? "yes" : "no";

    if (parsedAdditional.status !== undefined)
      user.status =
        parsedAdditional.status ? "active" : "Inactive";


    user.markModified("additionalInformation");

  }


  /* =========================================================
     SAVE USER
  ========================================================== */

  await user.save({ validateModifiedOnly: true });


  return res.status(200).json({

    success: true,
    message: "Customer updated successfully",
    data: user,

  });

});