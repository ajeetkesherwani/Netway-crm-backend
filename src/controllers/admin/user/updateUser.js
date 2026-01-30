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
    subZone
  } = req.body;

  const parsedCustomer = customer ? JSON.parse(customer) : {};
  const parsedAddresses = addresses ? JSON.parse(addresses) : {};
  const parsedAdditional = additional ? JSON.parse(additional) : {};

  // ====================================================================
  // 1. DOCUMENTS UPDATE - SAME LOGIC AS CREATE (RELIABLE & ROBUST)
  // ====================================================================

const uploadedFiles = req.files?.documents || [];

// --- STEP 1: Parse documentTypes in ALL possible ways (just like createUser) ---
let documentTypes = [];

// Case 1: documentTypes[]
if (req.body["documentTypes[]"]) {
  const arr = req.body["documentTypes[]"];
  documentTypes = Array.isArray(arr) ? arr : [arr];
}

// Case 2: plain documentTypes (single or array)
if (req.body.documentTypes) {
  const val = req.body.documentTypes;
  const arr = Array.isArray(val) ? val : [val];
  documentTypes = [...documentTypes, ...arr];
}

// Case 3: Indexed like documentTypes[0], documentTypes[1] (common in dynamic forms)
if (!documentTypes.length && uploadedFiles.length > 0) {
  for (let i = 0; i < uploadedFiles.length; i++) {
    const key = `documentTypes[${i}]`;
    if (req.body[key]) {
      documentTypes.push(req.body[key]);
    }
  }
}

// Clean and trim
documentTypes = documentTypes.map(t => t?.trim()).filter(Boolean);

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

// --- STEP 2: Parse existing documents to keep (sent as JSON string) ---
let filesToKeep = [];
if (req.body.existingDocuments) {
  try {
    const parsed = JSON.parse(req.body.existingDocuments);
    filesToKeep = Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    // Fallback: if not JSON, try array
    filesToKeep = Array.isArray(req.body.existingDocuments)
      ? req.body.existingDocuments
      : [];
  }
}

// Extract just filenames for comparison
filesToKeep = filesToKeep
  .map(f => (typeof f === "string" ? f.split("/").pop() : null))
  .filter(Boolean);

// --- STEP 3: Retain existing documents that user wants to keep ---
const retainedDocuments = [];

for (const doc of user.document || []) {
  let images = Array.isArray(doc.documentImage)
    ? doc.documentImage
    : [doc.documentImage].filter(Boolean);

  const keptImages = images.filter(img => {
    const filename = typeof img === "string" ? img.split("/").pop() : null;
    return filename && filesToKeep.includes(filename);
  });

  if (keptImages.length > 0) {
    retainedDocuments.push({
      documentType: doc.documentType,
      documentImage: doc.documentType === "Other" ? keptImages : keptImages[0],
    });
  }
}

// --- STEP 4: Process new uploaded files ---
const newDocumentMap = {};

uploadedFiles.forEach((file, i) => {
  let type = "Other"; // fallback

  if (i < documentTypes.length && documentTypes[i]) {
    const submittedType = documentTypes[i];
    if (validDocTypes.includes(submittedType)) {
      type = submittedType;
    }
  }

  if (!newDocumentMap[type]) newDocumentMap[type] = [];
  newDocumentMap[type].push(file.path || file.location || file.filename);
});

// Validate: only "Other" can have multiple new files
for (const [type, files] of Object.entries(newDocumentMap)) {
  if (type !== "Other" && files.length > 1) {
    return next(
      new AppError(
        `Multiple files not allowed for '${type}'. Only 'Other' supports multiple images.`,
        400
      )
    );
  }
}

// --- STEP 5: Merge new files into retained documents ---
for (const [type, newFiles] of Object.entries(newDocumentMap)) {
  let existingDoc = retainedDocuments.find(d => d.documentType === type);

  if (!existingDoc) {
    existingDoc = {
      documentType: type,
      documentImage: type === "Other" ? [] : null,
    };
    retainedDocuments.push(existingDoc);
  }

  if (type === "Other") {
    // Append new files
    const current = Array.isArray(existingDoc.documentImage)
      ? existingDoc.documentImage
      : [];
    existingDoc.documentImage = [...current, ...newFiles];
  } else {
    // Replace single file
    existingDoc.documentImage = newFiles[0];
  }
}

// Final assignment
user.document = retainedDocuments;
user.markModified("document");

  // ====================================================================
  // 2. GENERAL INFORMATION UPDATE
  // ====================================================================
  if (Object.keys(parsedCustomer).length > 0) {
    const gen = user.generalInformation;

    const set = (key, value) => {
      if (value !== undefined && value !== null) gen[key] = value;
    };

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

    // Installation By
    if (Array.isArray(parsedCustomer.installationBy)) {
      gen.installationBy = parsedCustomer.installationBy.filter(Boolean);
    }
    if (parsedCustomer.installationByName !== undefined) {
      gen.installationByName = parsedCustomer.installationByName?.trim() || null;
    }
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

    // Password update
    if (parsedCustomer.password?.trim()) {
      gen.plainPassword = parsedCustomer.password;
      gen.password = await bcrypt.hash(parsedCustomer.password, 10);
    }

    // Created For
    if (parsedCustomer.createdFor) {
      gen.createdFor = {
        type: parsedCustomer.createdFor.type || "Self",
        id: parsedCustomer.createdFor.id || null,
      };
    }

    user.markModified("generalInformation");
  }

  // ====================================================================
  // 3. ADDRESS UPDATE
  // ====================================================================
  if (Object.keys(parsedAddresses).length > 0) {
    const updateAddr = (target, source) => {
      if (source.addressLine1 !== undefined) target.addressine1 = source.addressLine1 || "";
      if (source.addressLine2 !== undefined) target.addressine2 = source.addressLine2 || "";
      if (source.city !== undefined) target.city = source.city || "";
      if (source.state !== undefined) target.state = source.state || "";
      if (source.pincode !== undefined) target.pincode = source.pincode || "";
    };

    if (parsedAddresses.billing) updateAddr(user.addressDetails.billingAddress, parsedAddresses.billing);
    if (parsedAddresses.permanent) updateAddr(user.addressDetails.permanentAddress, parsedAddresses.permanent);
    if (parsedAddresses.installation) updateAddr(user.addressDetails.installationAddress, parsedAddresses.installation);

    if (area !== undefined) user.addressDetails.area = area || null;
    if(subZone !== undefined) user.addressDetails.subZone = subZone || null;
    if (req.body.customArea !== undefined) user.addressDetails.customArea = req.body.customArea || "";

    user.markModified("addressDetails");
  }

  // ====================================================================
  // 4. PACKAGE UPDATE
  // ====================================================================
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
  // 6. ADDITIONAL & STATUS
  // ====================================================================
  if (Object.keys(parsedAdditional).length > 0) {
    const addl = user.additionalInformation;
    if (parsedAdditional.dob !== undefined) addl.dob = parsedAdditional.dob;
    if (parsedAdditional.description !== undefined) addl.description = parsedAdditional.description;
    if (parsedAdditional.ekYC !== undefined) addl.ekyc = parsedAdditional.ekYC ? "yes" : "no";

    if (parsedAdditional.status !== undefined) {
      user.status = parsedAdditional.status ? "active" : "Inactive";
    }

    user.markModified("additionalInformation");
  }

  // ====================================================================
  // 7. SAVE
  // ====================================================================
  await user.save({ validateModifiedOnly: true });

  return res.status(200).json({
    success: true,
    message: "Customer updated successfully",
    data: user,
  });
});