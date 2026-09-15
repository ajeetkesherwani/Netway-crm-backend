const Lead = require("../../../models/lead");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");

exports.updateLead = catchAsync(async (req, res, next) => {
  const { leadId } = req.params;
  if (!leadId) return next(new AppError("leadId is required", 400));

  const lead = await Lead.findById(leadId);
  if (!lead) return next(new AppError("Lead not found", 404));

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
    documents,       // JSON string: [{ documentType, files? }]
    callSource,
    severity,
    description,
    assignToId,
    assignToModel,
    stage,
  } = req.body;

  // ── Parse & merge documents ───────────────────────────────────────────────
  let updatedDocuments = lead.documents;
  if (documents !== undefined) {
    try {
      const parsedDocuments =
        typeof documents === "string" ? JSON.parse(documents) : documents;

      updatedDocuments = parsedDocuments.map((doc) => {
        const fieldKey = doc.documentType;
        const uploaded = req.files && req.files[fieldKey]
          ? req.files[fieldKey].map((f) => f.path)
          : [];
        return {
          documentType: doc.documentType,
          files: [...(doc.files || []), ...uploaded],
        };
      });

      // Handle extra uploaded fields not in the documents array
      if (req.files) {
        Object.keys(req.files).forEach((fieldKey) => {
          const alreadyAdded = updatedDocuments.find(
            (d) => d.documentType === fieldKey
          );
          if (!alreadyAdded) {
            updatedDocuments.push({
              documentType: fieldKey,
              files: req.files[fieldKey].map((f) => f.path),
            });
          }
        });
      }
    } catch (_) {
      return next(new AppError("Invalid documents JSON format", 400));
    }
  }

  // ── Apply updates ─────────────────────────────────────────────────────────
  if (contactName !== undefined) lead.contactName = contactName;
  if (contactNumber !== undefined) lead.contactNumber = contactNumber;
  if (email !== undefined) lead.email = email;
  if (company !== undefined) lead.company = company;
  if (state !== undefined) lead.state = state;
  if (district !== undefined) lead.district = district;
  if (address !== undefined) lead.address = address;
  if (area !== undefined) lead.area = area || null;
  if (zone !== undefined) lead.zone = zone || null;
  if (category !== undefined) lead.category = category;
  if (serviceRequired !== undefined) lead.serviceRequired = serviceRequired;
  if (callSource !== undefined) lead.callSource = callSource;
  if (severity !== undefined) lead.severity = severity;
  if (description !== undefined) lead.description = description;
  if (assignToId !== undefined) {
    if (Array.isArray(assignToId)) {
      lead.assignToId = assignToId;
    } else if (typeof assignToId === "string") {
      try {
        const parsed = JSON.parse(assignToId);
        lead.assignToId = Array.isArray(parsed) ? parsed : [parsed];
      } catch (e) {
        lead.assignToId = [assignToId];
      }
    } else {
      lead.assignToId = assignToId ? [assignToId] : [];
    }
  }
  if (assignToModel !== undefined) lead.assignToModel = assignToModel || null;
  if (stage !== undefined) lead.stage = stage;
  lead.documents = updatedDocuments;

  await lead.save();

  return successResponse(res, "Lead updated successfully", lead);
});
