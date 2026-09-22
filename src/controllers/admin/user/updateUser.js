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
const UserPackage = require("../../../models/userPackage");
const Package = require("../../../models/package");
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

  if (!documentTypes.length && uploadedFiles.length > 0) {
    for (let i = 0; i < uploadedFiles.length; i++) {
      const key = `documentTypes[${i}]`;
      if (req.body[key]) documentTypes.push(req.body[key]);
    }
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
    .map(f => typeof f === "string" ? f.split(/[/\\]/).pop() : null)
    .filter(Boolean);

  const shouldUpdateDocuments =
    uploadedFiles.length > 0 ||
    req.body.existingDocuments !== undefined ||
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
    if (req.body.existingDocuments !== undefined) {
      (user.document || []).forEach(doc => {
        const images = Array.isArray(doc.documentImage)
          ? doc.documentImage
          : doc.documentImage
            ? [doc.documentImage]
            : [];

        const remainingImages = images.filter(img =>
          typeof img === "string" && filesToKeep.includes(img.split(/[/\\]/).pop())
        );

        if (remainingImages.length > 0) {
          updatedDocuments.push({
            documentType: doc.documentType,
            documentImage: remainingImages
          });
        }
      });
    } else {
      updatedDocuments = (user.document || []).map(doc => ({
        documentType: doc.documentType,
        documentImage: Array.isArray(doc.documentImage)
          ? [...doc.documentImage]
          : doc.documentImage
            ? [doc.documentImage]
            : []
      }));
    }

    /* ADD / REPLACE NEW FILES */
    uploadedFiles.forEach((file, index) => {
      let type = documentTypes[index] || "Other";

      if (!validDocTypes.includes(type))
        type = "Other";

      const normalizedPath = file.path.replace(/\\/g, "/");

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

      if (!Array.isArray(existingDoc.documentImage)) {
        existingDoc.documentImage = existingDoc.documentImage ? [existingDoc.documentImage] : [];
      }
      existingDoc.documentImage.push(normalizedPath);
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

    if (parsedAddresses.billing) {
      if (parsedAddresses.billing.addressLine1 !== undefined && !parsedAddresses.billing.addressLine1.trim()) {
        return next(new AppError("Address Line 1 cannot be empty", 400));
      }
      if (parsedAddresses.billing.city !== undefined && !parsedAddresses.billing.city.trim()) {
        return next(new AppError("City cannot be empty", 400));
      }
      if (parsedAddresses.billing.state !== undefined && !parsedAddresses.billing.state.trim()) {
        return next(new AppError("State cannot be empty", 400));
      }
      if (parsedAddresses.billing.pincode !== undefined && !parsedAddresses.billing.pincode.trim()) {
        return next(new AppError("Pincode cannot be empty", 400));
      }
      updateAddr(user.addressDetails.billingAddress, parsedAddresses.billing);
    }

    if (parsedAddresses.permanent)
      updateAddr(user.addressDetails.permanentAddress, parsedAddresses.permanent);

    if (parsedAddresses.installation)
      updateAddr(user.addressDetails.installationAddress, parsedAddresses.installation);


    if (area !== undefined) {
      if (!area || !area.trim()) {
        return next(new AppError("Area cannot be empty", 400));
      }
      user.addressDetails.area = area;
    }

    if (subZone !== undefined) {
      if (!subZone || !subZone.trim()) {
        return next(new AppError("Zone cannot be empty", 400));
      }
      user.addressDetails.subZone = subZone;
    }

    if (req.body.customArea !== undefined)
      user.addressDetails.customArea = req.body.customArea || "";


    user.markModified("addressDetails");

  }


  /* =========================================================
     PACKAGE UPDATE (Multiple Packages Supported)
  ========================================================== */

  if (parsedCustomer.packages !== undefined || parsedCustomer.packageDetails !== undefined) {

    let rawPackages = [];
    if (Array.isArray(parsedCustomer.packages)) {
      rawPackages = parsedCustomer.packages;
    } else if (Array.isArray(parsedCustomer.packageDetails)) {
      rawPackages = parsedCustomer.packageDetails;
    } else if (parsedCustomer.packageDetails?.packageId) {
      rawPackages = [parsedCustomer.packageDetails];
    }

    const updatedPackageInfo = rawPackages
      .filter((p) => p && p.packageId && p.packageId !== "null")
      .map((p) => ({
        packageId: p.packageId,
        packageName: p.packageName || "",
        price: String(p.packageAmount || p.price || "0"),
      }));

    if (updatedPackageInfo.length === 0) {
      return next(new AppError("At least one package is mandatory", 400));
    }

    user.packageInfomation = updatedPackageInfo;
    user.markModified("packageInfomation");

    // Sync UserPackage documents
    for (const pkgInfo of updatedPackageInfo) {
      try {
        let existingUserPkg = await UserPackage.findOne({
          userId: user._id,
          packageId: pkgInfo.packageId,
        });

        if (existingUserPkg) {
          existingUserPkg.customPrice = Number(pkgInfo.price || existingUserPkg.customPrice || 0);
          existingUserPkg.packageName = pkgInfo.packageName || existingUserPkg.packageName;
          existingUserPkg.status = "active";
          await existingUserPkg.save();
        } else {
          const pkg = await Package.findById(pkgInfo.packageId);
          if (pkg) {
            const newUserPkg = new UserPackage({
              userId: user._id,
              packageId: pkgInfo.packageId,
              packageName: pkgInfo.packageName || pkg.name,
              basePrice: Number(pkg.basePrice || pkg.offerPrice || 0),
              customPrice: Number(pkgInfo.price || pkg.basePrice || pkg.offerPrice || 0),
              validity: pkg.validity,
              status: "active",
              startDate: pkg.fromDate,
              endDate: pkg.toDate,
              hasOtt: pkg.isOtt,
              hasIptv: pkg.isIptv,
            });
            await newUserPkg.save();
          }
        }
      } catch (pkgErr) {
        console.error("Error syncing UserPackage:", pkgErr);
      }
    }

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
     GENERAL INFORMATION UPDATE
  ========================================================== */

  if (parsedCustomer && Object.keys(parsedCustomer).length > 0) {

    if (parsedCustomer.UserId !== undefined || parsedCustomer.userId !== undefined) {
      const uId = (parsedCustomer.UserId !== undefined ? parsedCustomer.UserId : parsedCustomer.userId || "").trim();
      if (!uId) {
        return next(new AppError("User ID cannot be empty", 400));
      }
      user.generalInformation.UserId = uId;
    }

    if (parsedCustomer.title !== undefined)
      user.generalInformation.title = parsedCustomer.title;

    if (parsedCustomer.gender !== undefined)
      user.generalInformation.gender = parsedCustomer.gender;


    if (parsedCustomer.name !== undefined) {
      if (!parsedCustomer.name.trim()) {
        return next(new AppError("Name cannot be empty", 400));
      }
      user.generalInformation.name = parsedCustomer.name.trim();
    }

    if (parsedCustomer.billingName !== undefined)
      user.generalInformation.billingName = parsedCustomer.billingName;

    if (parsedCustomer.password !== undefined) {
      if (!parsedCustomer.password.trim()) {
        return next(new AppError("Password cannot be empty", 400));
      }
      user.generalInformation.password = parsedCustomer.password;
      user.generalInformation.plainPassword = parsedCustomer.password;
    }

    if (parsedCustomer.email !== undefined) {
      if (!parsedCustomer.email.trim()) {
        return next(new AppError("Email cannot be empty", 400));
      }
      user.generalInformation.email = parsedCustomer.email.trim();
    }

    if (parsedCustomer.mobile !== undefined) {
      if (!parsedCustomer.mobile.trim()) {
        return next(new AppError("Mobile Number cannot be empty", 400));
      }
      user.generalInformation.phone = parsedCustomer.mobile.trim();
    }

    if (parsedCustomer.alternateMobile !== undefined)
      user.generalInformation.alternatePhone = parsedCustomer.alternateMobile;

    if (parsedCustomer.ipactId !== undefined)
      user.generalInformation.ipactId = parsedCustomer.ipactId;

    if (parsedCustomer.serverType !== undefined)
      user.generalInformation.serverType = parsedCustomer.serverType || null;

    if (parsedCustomer.connectionType !== undefined) {
      if (!parsedCustomer.connectionType.trim()) {
        return next(new AppError("Connection Type cannot be empty", 400));
      }
      user.generalInformation.connectionType = parsedCustomer.connectionType?.toLowerCase();
    }

    if (parsedCustomer.selsExecutive !== undefined)
      user.generalInformation.selsExecutive = parsedCustomer.selsExecutive || null;

    if (parsedCustomer.installationBy !== undefined)
      user.generalInformation.installationBy = parsedCustomer.installationBy;

    if (parsedCustomer.installationByName !== undefined)
      user.generalInformation.installationByName = parsedCustomer.installationByName;

    if (parsedCustomer.installationBy !== undefined || parsedCustomer.installationByName !== undefined) {
      const hasInstaller =
        (Array.isArray(user.generalInformation.installationBy) && user.generalInformation.installationBy.length > 0) ||
        Boolean(user.generalInformation.installationByName?.trim());
      if (!hasInstaller) {
        return next(new AppError("Installation By is required", 400));
      }
    }

    if (parsedCustomer.ipAddress !== undefined)
      user.generalInformation.ipAdress = parsedCustomer.ipAddress;

    if (parsedCustomer.ipType !== undefined)
      user.generalInformation.ipType = parsedCustomer.ipType;

    if (parsedCustomer.serialNo !== undefined)
      user.generalInformation.serialNo = parsedCustomer.serialNo;

    if (parsedCustomer.macId !== undefined)
      user.generalInformation.macId = parsedCustomer.macId;

    if (parsedCustomer.serviceOpted !== undefined) {
      if (!parsedCustomer.serviceOpted.trim()) {
        return next(new AppError("Service Opted cannot be empty", 400));
      }
      user.generalInformation.serviceOpted = parsedCustomer.serviceOpted;
    }

    if (parsedCustomer.stbNo !== undefined)
      user.generalInformation.stbNo = parsedCustomer.stbNo;

    if (parsedCustomer.vcNo !== undefined)
      user.generalInformation.vcNo = parsedCustomer.vcNo;

    if (parsedCustomer.circuitId !== undefined)
      user.generalInformation.circuitId = parsedCustomer.circuitId;

    if (parsedCustomer.gstNo !== undefined)
      user.generalInformation.gst = parsedCustomer.gstNo;

    if (parsedCustomer.aadharNo !== undefined)
      user.generalInformation.adharNo = parsedCustomer.aadharNo;

    if (parsedCustomer.panNumber !== undefined)
      user.generalInformation.panNumber = parsedCustomer.panNumber;

    user.markModified("generalInformation");

  }


  /* =========================================================
     ADDITIONAL INFO UPDATE
  ========================================================== */

  if (Object.keys(parsedAdditional).length > 0) {

    const addl = user.additionalInformation;

    if (parsedAdditional.dob !== undefined) {
      if (!parsedAdditional.dob.trim()) {
        return next(new AppError("Date of Birth cannot be empty", 400));
      }
      addl.dob = parsedAdditional.dob;
    }

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