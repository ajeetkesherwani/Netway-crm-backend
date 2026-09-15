const express = require("express");
const router = express.Router();

const { adminAuthenticate } = require("../../controllers/admin/auth/adminAuthenticate");
const fileUploader = require("../../middlewares/fileUploader");
const { createLead } = require("../../controllers/admin/lead/createLead");
const { getLeadList } = require("../../controllers/admin/lead/getLead");
const { getLeadDetails } = require("../../controllers/admin/lead/getLeadDetails");
const { updateLead } = require("../../controllers/admin/lead/updateLead");
const { deleteLead } = require("../../controllers/admin/lead/deleteLead");

/**
 * Multi-document upload configuration.
 * Each document type maps to a multer field with up to 10 files.
 */
const DOCUMENT_FIELDS = [
  { name: "Profile Photo", maxCount: 4 },
  { name: "Addhar Card", maxCount: 4 },
  { name: "Pan Card", maxCount: 4 },
  { name: "Address Proof", maxCount: 4 },
  { name: "GST", maxCount: 4 },
  { name: "Driving Licence", maxCount: 4 },
  { name: "Passport", maxCount: 4 },
  { name: "Signature", maxCount: 4 },
  { name: "Other", maxCount: 4 },
];

// ── Routes ────────────────────────────────────────────────────────────────────

// Create lead (with multi-document upload)
router.post(
  "/create",
  fileUploader("lead", DOCUMENT_FIELDS),
  adminAuthenticate,
  createLead
);

// Get paginated + filtered lead list
router.get("/list", adminAuthenticate, getLeadList);

// Get single lead details
router.get("/view/:leadId", adminAuthenticate, getLeadDetails);

// Update lead (with multi-document upload)
router.patch(
  "/update/:leadId",
  fileUploader("lead", DOCUMENT_FIELDS),
  adminAuthenticate,
  updateLead
);

// Delete lead
router.delete("/delete/:leadId", adminAuthenticate, deleteLead);

module.exports = router;
