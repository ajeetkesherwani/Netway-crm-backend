const Lead = require("../../../models/lead");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");

exports.createLead = catchAsync(async (req, res, next) => {
  const {
    contactName,
    contactNumber,
    email,
    company,
    state,
    district,
    address,
    area,
    zone,
    category,
    serviceRequired,
    documents,      // JSON array: [{ documentType, existingFiles? }]
    callSource,
    severity,
    description,
    assignToId,
    assignToModel,
    stage,
  } = req.body;

  // ── Validation ────────────────────────────────────────────────────────────
  if (!contactName || !contactNumber) {
    return next(
      new AppError("contactName and contactNumber are required", 400)
    );
  }

  // ── Parse documents + attach uploaded files ───────────────────────────────
  // documents field comes as JSON string when using multipart/form-data
  let parsedDocuments = [];
  if (documents) {
    try {
      parsedDocuments = typeof documents === "string"
        ? JSON.parse(documents)
        : documents;
    } catch (_) {
      return next(new AppError("Invalid documents JSON format", 400));
    }
  }

  // Attach uploaded files to their respective document types
  if (req.files) {
    parsedDocuments = parsedDocuments.map((doc) => {
      const fieldKey = doc.documentType; // e.g. "Profile Photo"
      const uploaded = req.files[fieldKey] || [];
      return {
        documentType: doc.documentType,
        files: [
          ...(doc.files || []),
          ...uploaded.map((f) => f.path),
        ],
      };
    });

    // Handle any extra file fields not present in documents array
    Object.keys(req.files).forEach((fieldKey) => {
      const alreadyAdded = parsedDocuments.find(
        (d) => d.documentType === fieldKey
      );
      if (!alreadyAdded) {
        parsedDocuments.push({
          documentType: fieldKey,
          files: req.files[fieldKey].map((f) => f.path),
        });
      }
    });
  }

  // ── Creator context ───────────────────────────────────────────────────────
  const creatorId = req.user._id;
  const creatorRole = req.user.role; // Admin | Reseller | Lco | Staff

  let finalAssignToId = [];
  if (assignToId) {
    if (Array.isArray(assignToId)) {
      finalAssignToId = assignToId;
    } else if (typeof assignToId === "string") {
      try {
        const parsed = JSON.parse(assignToId);
        finalAssignToId = Array.isArray(parsed) ? parsed : [parsed];
      } catch (e) {
        // if not JSON array, treat as single string ID
        finalAssignToId = [assignToId];
      }
    } else {
      finalAssignToId = [assignToId];
    }
  }

  // ── Create Lead ───────────────────────────────────────────────────────────
  const newLead = await Lead.create({
    contactName,
    contactNumber,
    email,
    company,
    state,
    district,
    address,
    area: area || null,
    zone: zone || null,
    category: category || "New Connection",
    serviceRequired,
    documents: parsedDocuments,
    callSource,
    severity,
    description,
    assignToId: finalAssignToId,
    assignToModel: assignToModel || null,
    stage: stage || "New",
    createdById: creatorId,
    createdByType: creatorRole,
  });

  return successResponse(res, "Lead created successfully", newLead, 201);
});
