const User = require("../../../models/user");
const AppError = require("../../../utils/AppError");
const bcrypt = require("bcryptjs");
const { createLog } = require("../../../utils/userLogActivity");

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

    // Accept BOTH keys — documentTypes OR documentTypes[]
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

    // MUST BE ABOVE finalDocuments!
    const validDocTypes = [
      "ID proof",
      "Profile Id",
      "Adhar Card",
      "Insurence Paper",
      "Signature",
      "Other",
      "Pan Card",
      "Aadhar Card",
      "Address Proof"
    ];

    // Map files + types
    const finalDocuments = uploadedFiles.map((file, i) => ({
      documentType: validDocTypes.includes(documentTypes[i])
        ? documentTypes[i]
        : "Other",
      documentImage: file.filename
    }));

    console.log("FINAL DOCUMENTS:", finalDocuments);

    /** ------------------------------
     * 3. General Information
     * ------------------------------*/
    const generalInformation = {
      title: customer.title || "Mr",
      name: customer.name?.trim(),
      billingName: customer.billingName || customer.name,
      username: customer.username || customer.phone,
      password: "123456",
      plainPassword: "123456",
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
      serviceOpted: ["intercom", "broadband", "coporate"].includes(customer.serviceOpted?.toLowerCase())
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
        type: req.user.role
      }
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
      area: req.body.area && req.body.area.trim() !== "" ? req.body.area.trim() : null
    };

    /** ------------------------------
     * 5. Package Information
     * ------------------------------*/
    const packageInfomation = {
      packageId: customer.packageDetails?.packageId || null,
      packageName: customer.packageDetails?.packageName || "",
      price: customer.packageDetails?.packageAmount || ""
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
      dynamicIpPool: customer.dynamicIpPool || ""
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
      addCharges: false
    };

    /** ------------------------------
     * 8. Save User to DB
     * ------------------------------*/
    const newUser = await User.create({
      generalInformation,
      addressDetails,
      packageInfomation,
      networkInformation,
      additionalInformation,
      document: finalDocuments,
      status: additional.status ? "active" : "Inactive"
    });

    //

    await createLog({
      userId: newUser._id,
      type: "User Created",
      description: `New customer created: ${newUser.generalInformation.name}`,
      details: {
        email: newUser.generalInformation.email,
        phone: newUser.generalInformation.phone
      },
      ip: req.ip || req.headers["x-forwarded-for"] || "0.0.0.0",
      addedBy: {
        id: req.user._id,
        role: req.user.role || "Admin"
      }
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
