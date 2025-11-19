const User = require("../../../models/user");
const AppError = require("../../../utils/AppError");
const bcrypt = require("bcryptjs");

// exports.createUser = async (req) => {
//   let { generalInformation, networkInformation, additionalInformation, documents } = req.body;
// console.log(req.body, "req.body");
//   // Parse JSON if sent as string
//   if (typeof documents === "string") {
//     documents = JSON.parse(documents);
//   }

//   // // Validate required fields
//   // if (!generalInformation?.name || !generalInformation?.username || !generalInformation?.state) {
//   //   throw new AppError("Required fields: name, username, state", 400);
//   // }

//   // Validate username
//   // generalInformation.username = generalInformation.username.trim();
//   // if (!generalInformation.username) {
//   //   throw new AppError("Username cannot be empty", 400);
//   // }

//   //Unique username
//   const exists = await User.findOne({
//     "generalInformation.username": generalInformation.username
//   });
//   if (exists) {
//     throw new AppError("Username already exists", 409);
//   }

//   // Password hashing
//   // if (generalInformation.password) {
//   //   generalInformation.plainPassword = generalInformation.password;
//   //   generalInformation.password = await bcrypt.hash(generalInformation.password, 10);
//   // }

//   // Attach createdBy from authenticated user
//   generalInformation.createdBy = {
//     id: req.user._id,
//     type: req.user.role
//   };

//   // Validate createdFor
//   // if (!generalInformation.createdFor?.id || !generalInformation.createdFor?.type) {
//   //   throw new AppError("createdFor.id and createdFor.type are required", 400);
//   // }

//   // Handle documents
//   const uploadedFiles = req.files?.documents || [];
//   const finalDocuments = [];

//   if (Array.isArray(documents)) {
//     documents.forEach((doc, i) => {
//       const file = uploadedFiles[i];
//       finalDocuments.push({
//         documentType: doc.type,
//         documentImage: file?.filename || null
//       });
//     });
//   }

//   // Create user
//   const newUser = await User.create({
//     generalInformation,
//     networkInformation,
//     additionalInformation,
//     document: finalDocuments
//   });

//   return newUser;
// };


// exports.createUser = async (req, res, next) => {
//   try {
//     let {
//       generalInformation,
//       networkInformation,
//       additionalInformation,
//       documents
//     } = req.body;

//     if (typeof generalInformation === "string")
//       generalInformation = JSON.parse(generalInformation);
//     if (typeof networkInformation === "string")
//       networkInformation = JSON.parse(networkInformation);
//     if (typeof additionalInformation === "string")
//       additionalInformation = JSON.parse(additionalInformation);
//     if (typeof documents === "string")
//       documents = JSON.parse(documents);

//     // if (!generalInformation?.name) {
//     //   return res.status(400).json({ error: true, message: "Name required" });
//     // }

//     // if (!generalInformation?.username) {
//     //   return res.status(400).json({ error: true, message: "Username required" });
//     // }

//     // const exists = await User.findOne({
//     //   "generalInformation.username": generalInformation.username
//     // });

//     // if (exists) {
//     //   return res.status(409).json({
//     //     error: true,
//     //     message: "Username already exists"
//     //   });
//     // }

//     // if (generalInformation.password) {
//     //   generalInformation.plainPassword = generalInformation.password;
//     //   generalInformation.password = await bcrypt.hash(
//     //     generalInformation.password,
//     //     10
//     //   );
//     // }

//     generalInformation.createdBy = {
//       id: req.user._id,
//       type: req.user.role
//     };

//     const uploadedFiles = req.files?.documents || [];
//     const finalDocuments = [];

//     if (Array.isArray(documents)) {
//       documents.forEach((doc, index) => {
//         const file = uploadedFiles[index];
//         finalDocuments.push({
//           documentType: doc.type,
//           documentImage: file?.filename || ""
//         });
//       });
//     }

//     const newUser = await User.create({
//       generalInformation,
//       networkInformation,
//       additionalInformation,
//       document: finalDocuments
//     });

//     return res.status(201).json({
//       error: false,
//       message: "User created successfully",
//       data: newUser
//     });

//   } catch (err) {
//     console.log("Error:", err);
//     return res.status(500).json({
//       error: true,
//       message: "Internal server error",
//       details: err.message
//     });
//   }
// };

// controllers/admin/user/CreateUser.js

exports.createUser = async (req, res, next) => {
  try {
    console.log("Files:", req.files?.documents?.length || 0 , req.files?.documents , req.files );
    // console.log("documentTypes[]:", req.body["documentTypes[]"]);

    // 1. DOCUMENT TYPES SAFELY READ
    const documentTypes = Array.isArray(req.body["documentTypes[]"])
      ? req.body["documentTypes[]"]
      : req.body["documentTypes[]"]
      ? [req.body["documentTypes[]"]]
      : [];

    const uploadedFiles = req.files?.documents || [];

    // 2. generalInformation (exactly schema ke hisaab se)
    const generalInformation = {
      title: req.body.title || "Mr",
      name: req.body.name?.trim(),
      billingName: req.body.billingName || req.body.name,
      username: req.body.username || req.body.phone,
      password: "123456", // plain password bhi set kar denge
      plainPassword: "123456",
      email: req.body.email,
      phone: req.body.phone,
      alternatePhone: req.body.alternatePhone || "",
      ipactId: req.body.accountId || "",
      connectionType: req.body.connectionType === "ILL" ? "iil" : (req.body.connectionType?.toLowerCase() || "other"),
      installationByName: req.body.installationByName || "",
      ipAdress: req.body.ipAdress || "",
      ipType: req.body.ipType || "static",
      serialNo: req.body.serialNo || "",
      macId: req.body.macId || "",
      serviceOpted: ["intercom", "broadband", "coporate"].includes(req.body.serviceOpted?.toLowerCase())
        ? req.body.serviceOpted.toLowerCase()
        : "broadband",
      stbNo: req.body.stbNo || "",
      vcNo: req.body.vcNo || "",
      cafNo: req.body.cafNo || "",
      gst: req.body.gst || "",
      adharNo: req.body.adharNo || "",
      address: req.body.address || "N/A",
      pincode: req.body.pincode || "",
      state: req.body.state || "",
      district: req.body.district || "",
      country: req.body.country || "India",
      paymentMethod: req.body.paymentMethod || "Cash",
      createdBy: {
        id: req.user._id,
        type: req.user.role
      }
    };

    // 3. addressDetails (tera schema ke exact naam se)
 const addressDetails = {
  billingAddress: {
    addressLine1: req.body.addressLine1 || "",
    addressLine2: req.body.addressLine2 || "",
    city: req.body.city || "",
    state: req.body.state || "",
    pincode: req.body.pincode || "",
  },
  permanentAddress: {
    addressLine1: req.body.addressLine1 || "",
    addressLine2: req.body.addressLine2 || "",
    city: req.body.city || "",
    state: req.body.state || "",
    pincode: req.body.pincode || "",
  },
  installationAddress: {
    addressLine1: req.body.installationAddressLine1 || req.body.addressLine1 || "",
    addressLine2: req.body.installationAddressLine2 || req.body.addressLine2 || "",
    city: req.body.installationCity || req.body.city || "",
    state: req.body.state || "",
    pincode: req.body.pincode || "",
  },
  area: req.body.area || ""
};

    // 4. packageInfomation
    const packageInfomation = {
      packageId: req.body.packageId || null,
      packageName: req.body.packageName || "",
      price: req.body.packageAmount || ""
    };

    // 5. networkInformation
    const networkInformation = {
      networkType: req.body.networkType || "PPPOE",
      ipType: req.body.ipType === "static" ? "Static IP" : "Dynamic IP Pool",
      statisIp: req.body.ipType === "static"
        ? { nas: [""], category: "" }
        : undefined,
      dynamicIpPool: req.body.dynamicIpPool || ""
    };

    // 6. additionalInformation
    const additionalInformation = {
      dob: req.body.dob || "",
      description: req.body.description || "",
      ekyc: req.body.ekyc || "no",
      notification: true,
      addPlan: true,
      addCharges: false
    };

    // 7. Documents (tera schema ke exact enum ke hisaab se)
    const validDocTypes = ["ID proof", "Profile Id", "Adhar Card", "Insurence Paper", "Signature", "Other"];
    const finalDocuments = documentTypes.map((type, i) => ({
      documentType: validDocTypes.includes(type) ? type : "Other",
      documentImage: uploadedFiles[i]?.filename || ""
    }));

    console.log("finalDocument" ,finalDocuments )

    // 8. FINAL USER CREATE
    const newUser = await User.create({
      generalInformation,
      addressDetails,
      packageInfomation,
      networkInformation,
      additionalInformation,
      document: finalDocuments,
      status: req.body.status === "active" ? "active" : "Inactive"
    });

    return res.status(201).json({
      success: true,
      message: "Customer created successfully!",
      data: newUser
    });

  } catch (err) {
    console.error("CREATE USER ERROR:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to create customer",
      error: err.message
    });
  }
};