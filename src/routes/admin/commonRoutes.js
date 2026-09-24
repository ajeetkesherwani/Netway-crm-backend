const express = require("express");

const {
    adminAuthenticate
} = require("../../controllers/admin/auth/adminAuthenticate");

const {
    searchUsersByName
} = require("../../controllers/admin/common/getUserByName");

const {
    userGlobalDetails
} = require("../../controllers/admin/common/userGlobalDetails");

    const {
        getStaffRoleList
    } = require("../../controllers/admin/common/getStaffRoleList");

    const {
        getAllRoles
    } = require("../../controllers/admin/common/getAllRoles");

const {
    getUserPurchasedPlans
} = require("../../controllers/admin/common/UserPurchedPlanList");

const { 
    getAllReassignedTickets 
} = require("../../controllers/admin/common/reAssignTicketList");

const { 
    getLogsByRoleAndId
} = require("../../controllers/admin/common/getLogsActivity");

const {
    getPackageList
} = require("../../controllers/admin/common/getPackageList");

const {
    getInvoiceList
} = require("../../controllers/admin/common/getInvoiceList");

const {
    getTaxInvoiceList
} = require("../../controllers/admin/common/getTaxInvoiceList");

const {
    getInvoiceDetails
} = require("../../controllers/admin/common/getInvoiceDetails");

const { 
    getUserInvoice 
} = require("../../controllers/admin/common/gerUserInoiveList");

const {
    getUserAssignedHardware
} = require("../../controllers/admin/common/getAssignedHardwareList");

const {
    getCountSummary
} = require("../../controllers/admin/common/getCounts");
const { deleteInvoice } = require("../../controllers/admin/common/deleteInvoice");

const router = express.Router();

router.get("/user/details", adminAuthenticate, searchUsersByName);
router.get("/staff/roleList", adminAuthenticate, getStaffRoleList);
router.get("/staff/allRoles", adminAuthenticate, getAllRoles);
router.get("/user/purchedPlan", adminAuthenticate, getUserPurchasedPlans);
router.get("/reassign/ticket/list", adminAuthenticate, getAllReassignedTickets);
router.get("/user/Global/details/:id", adminAuthenticate, userGlobalDetails);
router.get("/logList/:role/:id", adminAuthenticate, getLogsByRoleAndId);
router.get("/filterPackage/list", adminAuthenticate, getPackageList);
router.get("/invoiceList", adminAuthenticate, getInvoiceList);
router.get("/taxInvoiceList", adminAuthenticate, getTaxInvoiceList);
router.get("/invoice/:invoiceId", adminAuthenticate, getInvoiceDetails);
router.delete("/delete/:invoiceId", adminAuthenticate, deleteInvoice);
router.get("/user/invoice/:userId", adminAuthenticate, getUserInvoice);
router.get("/user/hardware/:userId", adminAuthenticate, getUserAssignedHardware);
router.get("/count/summary", adminAuthenticate, getCountSummary);

// Direct SMS Test endpoint for Postman
router.post("/test-sms", async (req, res) => {
  try {
    const { mobile, templateName, variables, message } = req.body;
    if (!mobile) return res.status(400).json({ error: "mobile is required" });

    if (message) {
      const { sendSMS } = require("../../utils/sendSms");
      const providerRes = await sendSMS(mobile, message);
      return res.status(200).json({ status: true, providerRes, message });
    }

    const { sendTemplateSMS } = require("../../utils/smsService");
    const providerRes = await sendTemplateSMS(
      mobile,
      templateName || "your account has been created",
      variables || { plan: "Test Plan", username: "TESTUSER", password: "123" }
    );
    return res.status(200).json({ status: true, providerRes });
  } catch (err) {
    return res.status(500).json({ status: false, error: err.message });
  }
});

module.exports = router;