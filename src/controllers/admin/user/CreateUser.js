const User = require("../../../models/user");
const AppError = require("../../../utils/AppError");
const bcrypt = require("bcryptjs");
const { createLog } = require("../../../utils/userLogActivity");
const UserPackage = require("../../../models/userPackage");
const { sendTemplateSMS } = require("../../../utils/smsService");
const Package = require("../../../models/package");
const { addIpacctUser } = require("../../../services/ipacctUserServices");
const Zone = require("../../../models/zone");


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
     * Mandatory Field Validations
     * ------------------------------*/
    if (!customer.name || !customer.name.trim()) {
      throw new AppError("Name is required", 400);
    }
    const customerUserId = (customer.UserId || customer.userId)?.trim();
    if (!customerUserId) {
      throw new AppError("User ID is required", 400);
    }
    if (!customer.email || !customer.email.trim()) {
      throw new AppError("Email is required", 400);
    }
    if (!customer.mobile || !customer.mobile.trim()) {
      throw new AppError("Mobile Number is required", 400);
    }
    if (!customer.password || !customer.password.trim()) {
      throw new AppError("Password is required", 400);
    }
    if (!additional.dob || !additional.dob.trim()) {
      throw new AppError("Date of Birth is required", 400);
    }
    if (!customer.connectionType || !customer.connectionType.trim()) {
      throw new AppError("Connection Type is required", 400);
    }
    const hasInstaller =
      (Array.isArray(customer.installationBy) && customer.installationBy.length > 0) ||
      Boolean(customer.installationByName?.trim());
    if (!hasInstaller) {
      throw new AppError("Installation By is required", 400);
    }
    if (!customer.serviceOpted || !customer.serviceOpted.trim()) {
      throw new AppError("Service Opted is required", 400);
    }
    const billingAddr = addresses.billing || {};
    if (!billingAddr.addressLine1 || !billingAddr.addressLine1.trim()) {
      throw new AppError("Address Line 1 is required", 400);
    }
    if (!billingAddr.city || !billingAddr.city.trim()) {
      throw new AppError("City is required", 400);
    }
    if (!billingAddr.state || !billingAddr.state.trim()) {
      throw new AppError("State is required", 400);
    }
    if (!billingAddr.pincode || !billingAddr.pincode.trim()) {
      throw new AppError("Pincode is required", 400);
    }
    const areaId = (req.body.area || "").trim();
    if (!areaId) {
      throw new AppError("Area is required", 400);
    }
    const subZoneId = (req.body.subZone || "").trim();
    if (!subZoneId) {
      throw new AppError("Zone is required", 400);
    }

    /** ------------------------------
     * 2. Documents + Document Types
     * ------------------------------*/
    const uploadedFiles = req.files?.documents || [];
    console.log("UPLOADED FILES:", uploadedFiles);

    // Handle documentTypes (single or array) and documentTypes[] from form-data
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
      documentMap[type].push(file.path.replace(/\\/g, "/"));
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
      UserId: customerUserId,
      gender: customer.gender || "Male",
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
      gst: customer.gstNo || "",
      adharNo: customer.aadharNo || "",
      panNumber: customer.panNumber || "",
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
        id: req.user.role === "Admin"
          ? req.user._id
          : customer.createdFor?.id || req.user._id,

        type: req.user.role === "Admin"
          ? "Admin"
          : customer.createdFor?.type || "Self",
      },


      // createdFor: {
      //   id: customer.createdFor?.id || null,
      //   type: customer.createdFor?.type || "Self",
      // },
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
      area: areaId,
      subZone: subZoneId,
    };

    /** ------------------------------
     * 5. Package Information (Multiple Packages Supported)
     * ------------------------------*/
    let rawPackages = [];
    if (Array.isArray(customer.packages) && customer.packages.length > 0) {
      rawPackages = customer.packages;
    } else if (Array.isArray(customer.packageDetails) && customer.packageDetails.length > 0) {
      rawPackages = customer.packageDetails;
    } else if (customer.packageDetails?.packageId) {
      rawPackages = [customer.packageDetails];
    }

    const packageInfomation = rawPackages
      .filter((p) => p && p.packageId && p.packageId !== "null")
      .map((p) => ({
        packageId: p.packageId,
        packageName: p.packageName || "",
        price: String(p.packageAmount || p.price || "0"),
      }));

    if (packageInfomation.length === 0) {
      throw new AppError("At least one package is mandatory", 400);
    }

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

    // Assign packages to user
    for (const pkgInfo of packageInfomation) {
      if (pkgInfo.packageId && pkgInfo.packageId !== "null") {
        await userPackageAssign(newUser._id, pkgInfo);
      }
    }

    // ── IPACCT Integration ──────────────────────────────────────────
    try {
      // Find the first assigned package to get its IPACCT ID if any
      let ipacctPackageId = null;
      let ipacctPackageName = "";
      let ipacctFee = "0";
      if (packageInfomation.length > 0) {
        const firstPkg = await Package.findById(packageInfomation[0].packageId);
        if (firstPkg && firstPkg.IppactId) {
           ipacctPackageId = firstPkg.IppactId;
        }
        ipacctPackageName = firstPkg ? (firstPkg.name || "") : packageInfomation[0].packageName;
        ipacctFee = firstPkg ? String(firstPkg.basePrice || firstPkg.offerPrice || "0") : String(packageInfomation[0].price || "0");
      }

      // Find the selected zone to get its IPACCT ID
      let ipacctZoneId = 0;
      let ipacctZoneName = "";
      if (addressDetails.area) {
        const selectedZone = await Zone.findById(addressDetails.area);
        if (selectedZone && selectedZone.ipacctZoneId) {
          ipacctZoneId = selectedZone.ipacctZoneId;
        }
        if (selectedZone) {
          ipacctZoneName = selectedZone.name || "";
        }
      }

      console.log("---- STARTING IPACCT USER CREATION ----");
      const ipacctRes = await addIpacctUser({
        name: generalInformation.name,
        address: addressDetails.billingAddress?.addressine1 || "",
        pin: addressDetails.billingAddress?.pincode || "",
        phone: generalInformation.phone,
        mobile: generalInformation.phone,
        username: generalInformation.username,
        password: generalInformation.plainPassword,
        email: generalInformation.email,
        packageId: ipacctPackageId,
        packageName: ipacctPackageName,
        fee: ipacctFee,
        zoneid: ipacctZoneId,
        zonename: ipacctZoneName,
      });
      console.log("---- IPACCT USER CREATION RESPONSE ----");
      console.log(JSON.stringify(ipacctRes, null, 2));
      console.log("---------------------------------------");

      if (ipacctRes && ipacctRes.return) {
        const ret = ipacctRes.return;
        
        // Extract id and cid. Depending on xml2js parsing, they might have a '_' property or be direct strings.
        const ipacctId = typeof ret.id === "object" ? (ret.id._ || ret.id) : ret.id;
        const ipacctCid = typeof ret.cid === "object" ? (ret.cid._ || ret.cid) : ret.cid;
        
        if (ipacctId && ipacctId !== "-1") {
          newUser.generalInformation.ipactId = ipacctId;
          newUser.generalInformation.ipacctCustomerId = ipacctCid;
          await newUser.save();
          console.log(`Saved IPACCT IDs to CRM User: ipactId=${ipacctId}, ipacctCustomerId=${ipacctCid}`);
        }
      }
    } catch (ipacctErr) {
      console.error("Failed to create user in IPACCT:", ipacctErr.message);
    }
    // ────────────────────────────────────────────────────────────────

    await createLog({
      userId: newUser._id,
      type: "User Created",
      description: `New customer created: ${newUser.generalInformation.name}`,
      details: {
        email: newUser.generalInformation.email,
        phone: newUser.generalInformation.phone,
        userId: newUser.generalInformation.username,
      },
    });

    /** ------------------------------
     * 9. Send SMS
     * ------------------------------*/
    try {
      const mobile = newUser.generalInformation.phone;

      if (mobile) {
        const planNames =
          packageInfomation.map((p) => p.packageName).filter(Boolean).join(", ") ||
          "Default Plan";

        await sendTemplateSMS(
          mobile,
          "your account created",
          {
            plan: planNames,
            username: newUser.generalInformation.username,
            password: newUser.generalInformation.plainPassword
          }
        );
      }
    } catch (error) {
      console.log("User creation SMS failed:", error.message);
    }



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
