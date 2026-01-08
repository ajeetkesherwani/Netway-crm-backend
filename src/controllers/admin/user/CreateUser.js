const User = require("../../../models/user");
const AppError = require("../../../utils/AppError");
const bcrypt = require("bcryptjs");
const { createLog } = require("../../../utils/userLogActivity");
const UserPackage = require("../../../models/userPackage");
const Package = require("../../../models/package");

// Assign package to user

async function userPackageAssign(userId, packageInfo) {
  const pkg = await Package.findById(packageInfo.packageId);

  if (!pkg) {
    throw new AppError("Package not found", 404);
  }

  const userPackage = new UserPackage({
    userId: userId,
    packageId: packageInfo.packageId,
    packageName: packageInfo.packageName,
    // basePrice: packageInfo.price,
    // cutomePrice: packageInfo.price,
    basePrice: Number(pkg.basePrice || pkg.offerPrice || 0),
    customPrice: Number(
      packageInfo.price || pkg.basePrice || pkg.offerPrice || 0
    ),
    validity: pkg.validity,
    status: "active",
    startDate: pkg.fromDate,
    endDate: pkg.toDate,
    hasOtt: pkg.isOtt,
    hasIptv: pkg.isIptv,
  });

  await userPackage.save();

  return true;
}

function generateUsername(name) {
  const upperName = name.trim().toUpperCase().replace(/\s+/g, "");
  const randomFour = Math.floor(1000 + Math.random() * 9000);
  return `${upperName}${randomFour}`;
}

exports.createUser = async (req, res, next) => {
  try {
    console.log("REQ BODY:", req.body);
    console.log("FILES:", req.files);

    /** ------------------------------
     * 1. Parse incoming JSON fields
     * ------------------------------*/
    const customer = JSON.parse(req.body.customer || "{}");
    const addresses = JSON.parse(req.body.addresses || "{}");
    const payment = JSON.parse(req.body.payment || "{}");
    const additional = JSON.parse(req.body.additional || "{}");

    /** ------------------------------
   * 2. Documents + Document Types
   * ------------------------------*/
    const uploadedFiles = req.files?.documents || [];
    console.log("UPLOADED FILES:", uploadedFiles);

    // Handle documentTypes (single or array) and documentTypes[] from form-data
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

    console.log("DOCUMENT TYPES RECEIVED:", documentTypes);

    // Your valid document types
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
    // const validDocTypes = [
    //   "ID proof",
    //   "Profile Id",
    //   "Adhar Card",
    //   "Insurence Paper",
    //   "Signature",
    //   "Other",
    //   "Pan Card",
    //   "Aadhar Card",
    //   "Address Proof",
    // ];

    // Group files by document type
    const documentMap = {};

    uploadedFiles.forEach((file, i) => {
      let type = "Other"; // default fallback

      if (i < documentTypes.length && documentTypes[i]) {
        const submittedType = documentTypes[i].trim();
        if (validDocTypes.includes(submittedType)) {
          type = submittedType;
        }
      }

      if (!documentMap[type]) {
        documentMap[type] = [];
      }
      documentMap[type].push(file.path); // or file.location if using cloud storage
    });

    // Build final documents + enforce rule: multiple images ONLY for "Other"
    const finalDocuments = [];

    for (const [type, files] of Object.entries(documentMap)) {
      // Block multiple files for any type except "Other"
      if (type !== "Other" && files.length > 1) {
        throw new AppError(
          `Multiple files are not allowed for '${type}'. Only 'Other' type supports multiple images.`,
          400
        );
      }

      finalDocuments.push({
        documentType: type,
        documentImage: files, // array → single or multiple based on type
      });
    }

    console.log("FINAL DOCUMENTS:", finalDocuments);


    //     const uploadedFiles = req.files?.documents || [];

    //     // Accept BOTH keys — documentTypes OR documentTypes[]
    //     let documentTypes = [];

    //     if (req.body.documentTypes) {
    //       documentTypes = Array.isArray(req.body.documentTypes)
    //         ? req.body.documentTypes
    //         : [req.body.documentTypes];
    //     }

    //     if (req.body["documentTypes[]"]) {
    //       const arr = req.body["documentTypes[]"];
    //       documentTypes = Array.isArray(arr) ? arr : [arr];
    //     }

    //     console.log("DOCUMENT TYPES RECEIVED:", documentTypes);

    //     // MUST BE ABOVE finalDocuments!
    //     const validDocTypes = [
    //       "ID proof",
    //       "Profile Id",
    //       "Adhar Card",
    //       "Insurence Paper",
    //       "Signature",
    //       "Other",
    //       "Pan Card",
    //       "Aadhar Card",
    //       "Address Proof",
    //     ];

    //     // Map files + types
    //     const documentMap = {};

    // uploadedFiles.forEach((file, i) => {
    //   const type = validDocTypes.includes(documentTypes[i])
    //     ? documentTypes[i]
    //     : "Other";

    //   if (!documentMap[type]) {
    //     documentMap[type] = [];
    //   }

    //   documentMap[type].push(file.path);
    // });

    // const finalDocuments = [];

    // for (const type in documentMap) {
    //   const files = documentMap[type];

    //   //block multiple files for non-Other
    //   if (type !== "Other" && files.length > 1) {
    //     throw new AppError(`${type} allows only ONE file`, 400);
    //   }

    //   finalDocuments.push({
    //     documentType: type,          
    //     documentImage: files,       
    //   });
    // }

    //     console.log("FINAL DOCUMENTS:", finalDocuments);

    /** ------------------------------
     * 3. General Information
     * ------------------------------*/

    const rawPassword = customer.password;

    const generalInformation = {
      title: customer.title || "Mr",
      name: customer.name?.trim(),
      billingName: customer.billingName || customer.name,
      // username: customer.username || customer.phone,
      username: generateUsername(customer.name),
      password: rawPassword,
      plainPassword: rawPassword,
      email: customer.email,
      phone: customer.mobile,
      alternatePhone: customer.alternateMobile || "",
      ipactId: customer.accountId || "",
      connectionType: customer.connectionType?.toLowerCase() || "other",
      selsExecutive: customer.selsExecutive || null,
      installationBy: customer.installationBy || [],
      installationByName: customer.installationByName || "",
      ipAdress: customer.ipAddress || "",
      ipType: customer.ipType || "static",
      serialNo: customer.serialNo || "",
      macId: customer.macId || "",
      serviceOpted: ["intercom", "broadband", "coporate"].includes(
        customer.serviceOpted?.toLowerCase()
      )
        ? customer.serviceOpted.toLowerCase()
        : "broadband",
      stbNo: customer.stbNo || "",
      vcNo: customer.vcNo || "",
      circuitId: customer.circuitId || "",
      cafNo: "",
      gst: "",
      adharNo: customer.aadharNo || "",
      address: "",
      pincode: "",
      state: "",
      district: "",

      country: "India",

      createdBy: {
        id: req.user._id,
        type: req.user.role,
      },

      createdFor: {
        id: customer.createdFor?.id || null,
        type: customer.createdFor?.type || "Self",
      },
    };

    /** ------------------------------
     * 4. Address Details
     * ------------------------------*/
    const addressDetails = {
      billingAddress: {
        addressine1: addresses.billing.addressLine1 || "",
        addressine2: addresses.billing.addressLine2 || "",
        city: addresses.billing.city || "",
        state: addresses.billing.state || "",
        pincode: addresses.billing.pincode || "",
      },
      permanentAddress: {
        addressine1: addresses.permanent.addressLine1 || "",
        addressine2: addresses.permanent.addressLine2 || "",
        city: addresses.permanent.city || "",
        state: addresses.billing.state || "",
        pincode: addresses.billing.pincode || "",
      },
      installationAddress: {
        addressine1: addresses.installation.addressLine1 || "",
        addressine2: addresses.installation.addressLine2 || "",
        city: addresses.installation.city || "",
        state: addresses.billing.state || "",
        pincode: addresses.billing.pincode || "",
      },

      /** IMPORTANT — area must be ObjectId */
      area:
        req.body.area && req.body.area.trim() !== ""
          ? req.body.area.trim()
          : null,

          subZone:
    req.body.subZone && req.body.subZone.trim() !== ""
      ? req.body.subZone.trim()
      : null,
    };

    /** ------------------------------
     * 5. Package Information
     * ------------------------------*/
    const packageInfomation = {
      packageId: customer.packageDetails?.packageId || null,
      packageName: customer.packageDetails?.packageName || "",
      price: customer.packageDetails?.packageAmount || "",
    };

    /** ------------------------------
     * 6. Network Information
     * ------------------------------*/
    const networkInformation = {
      networkType: customer.networkType || "PPPOE",
      ipType: customer.ipType === "Static IP" ? "Static IP" : "Dynamic IP Pool",
      statisIp:
        customer.ipType === "Static IP"
          ? { nas: [""], category: "" }
          : undefined,
      dynamicIpPool: customer.dynamicIpPool || "",
    };

    /** ------------------------------
     * 7. Additional Information
     * ------------------------------*/
    const additionalInformation = {
      dob: additional.dob || "",
      description: additional.description || "",
      ekyc: additional.ekYC ? "yes" : "no",
      notification: true,
      addPlan: true,
      addCharges: false,
    };

    /** ------------------------------
     * 8. Save User to DB
     * ------------------------------*/
    console.log("generalInformation", generalInformation);
    const newUser = await User.create({
      generalInformation,
      addressDetails,
      packageInfomation,
      networkInformation,
      additionalInformation,
      document: finalDocuments,
      status: additional.status ? "active" : "Inactive",
    });

    // Assign package to user
    // userPackageAssign(newUser._id, packageInfomation);
    if (packageInfomation.packageId && packageInfomation.packageId !== "null") {
      await userPackageAssign(newUser._id, packageInfomation);
    }

    await createLog({
      userId: newUser._id,
      type: "User Created",
      description: `New customer created: ${newUser.generalInformation.name}`,
      details: {
        email: newUser.generalInformation.email,
        phone: newUser.generalInformation.phone,
        userId: newUser.generalInformation.username,
      },
      ip: req.ip || req.headers["x-forwarded-for"] || "0.0.0.0",
      addedBy: {
        id: req.user._id,
        role: req.user.role || "Admin",
      },
    });

    return res.status(201).json({
      success: true,
      message: "Customer created successfully!",
      data: newUser,
    });
  } catch (err) {
    console.error("CREATE USER ERROR:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to create customer",
      error: err.message,
    });
  }
};
