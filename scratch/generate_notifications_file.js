const fs = require("fs");
const path = require("path");

const activeNotifications = [
  {
    "S_No": 1,
    "Channel": "SMS",
    "Action_Name": "Cron Job: Plan Expiry Reminder (3 Days Before)",
    "Trigger_Condition": "Plan diffDays === 3 and !smsReminder3Sent",
    "Source_API_Route": "node-cron schedule -> expirePurchasedPlans()",
    "Notification_Template_Name": "your internet going to be expired soon",
    "Recipient": "Customer Mobile Number",
    "File_Path": "src/jobs/expirePurchasedPlans.js",
    "Line_Number": 83,
    "Message_Content": "Dear Customer your internet going to be expired soon, kindly renew it today. Please ignore if you already renewed. Netway Internet Services",
    "Status": "Active"
  },
  {
    "S_No": 2,
    "Channel": "SMS",
    "Action_Name": "Cron Job: Plan Expiry Reminder (1 Day Before)",
    "Trigger_Condition": "Plan diffDays === 1 and !smsReminder1Sent",
    "Source_API_Route": "node-cron schedule -> expirePurchasedPlans()",
    "Notification_Template_Name": "your internet going to be expired soon",
    "Recipient": "Customer Mobile Number",
    "File_Path": "src/jobs/expirePurchasedPlans.js",
    "Line_Number": 89,
    "Message_Content": "Dear Customer your internet going to be expired soon, kindly renew it today. Please ignore if you already renewed. Netway Internet Services",
    "Status": "Active"
  },
  {
    "S_No": 3,
    "Channel": "SMS",
    "Action_Name": "Cron Job: Account Expiry Alert (On Expiry Day)",
    "Trigger_Condition": "Plan diffDays === 0 and !smsExpirySent",
    "Source_API_Route": "node-cron schedule -> expirePurchasedPlans()",
    "Notification_Template_Name": "Account Expiry",
    "Recipient": "Customer Mobile Number",
    "File_Path": "src/jobs/expirePurchasedPlans.js",
    "Line_Number": 95,
    "Message_Content": "Dear Customer, Your account will expire on {expiryDate}. Please renew the same to avoid disconnection. Netway Internet.",
    "Status": "Active"
  },
  {
    "S_No": 4,
    "Channel": "SMS",
    "Action_Name": "Purchased Plan Created: Internet Bill Notification",
    "Trigger_Condition": "Plan successfully purchased and invoice generated",
    "Source_API_Route": "POST /api/admin/purchasedPlan/create",
    "Notification_Template_Name": "Internet bill",
    "Recipient": "Customer Mobile Number",
    "File_Path": "src/controllers/admin/purchasedPlan/createPurchasedPlan.js",
    "Line_Number": 249,
    "Message_Content": "Dear Customer, your internet bill {billNo} has been generated. Please pay your bill before due date {dueDate} to avoid suspension of internet. Regards, Netway Internet Services",
    "Status": "Active"
  },
  {
    "S_No": 5,
    "Channel": "SMS",
    "Action_Name": "Purchased Plan Created: Login Credentials Notification",
    "Trigger_Condition": "Plan purchased and credentials distributed",
    "Source_API_Route": "POST /api/admin/purchasedPlan/create",
    "Notification_Template_Name": "Plan login credentials",
    "Recipient": "Customer Mobile Number",
    "File_Path": "src/controllers/admin/purchasedPlan/createPurchasedPlan.js",
    "Line_Number": 343,
    "Message_Content": "Welcome to Netway Internet, your account has been created, you have chosen {plan} plan. Your username is {username} and password is {password}. For login http://erp.netwayinternetservices.co.in",
    "Status": "Active"
  },
  {
    "S_No": 6,
    "Channel": "SMS",
    "Action_Name": "User Creation: Welcome & Credentials Notification",
    "Trigger_Condition": "New customer registered by Admin",
    "Source_API_Route": "POST /api/admin/user/create",
    "Notification_Template_Name": "your account created (Intended: your account has been created)",
    "Recipient": "Customer Mobile Number",
    "File_Path": "src/controllers/admin/user/CreateUser.js",
    "Line_Number": 473,
    "Message_Content": "Welcome to Netway Internet, your account has been created, you have chosen {plan} plan. Your username is {username} and password is {password}. For login http://erp.netwayinternet.co.in",
    "Status": "Active (Key requires template alignment)"
  },
  {
    "S_No": 7,
    "Channel": "SMS",
    "Action_Name": "Retailer / Reseller Creation: Account Created Notification",
    "Trigger_Condition": "New retailer/reseller account created",
    "Source_API_Route": "POST /api/admin/retailer/create",
    "Notification_Template_Name": "Your_account_created",
    "Recipient": "Retailer Mobile Number",
    "File_Path": "src/controllers/admin/retailer/createRetailer.js",
    "Line_Number": 125,
    "Message_Content": "Welcome to Netway Internet Services, your account has been created, you have chosen {plan}. Your username is {username} and password is {password}. For login https://erp.netwayinternetservices.co.in/",
    "Status": "Active"
  },
  {
    "S_No": 8,
    "Channel": "SMS",
    "Action_Name": "Ticket Creation: Complaint Registered Notification",
    "Trigger_Condition": "New complaint ticket created by Admin",
    "Source_API_Route": "POST /api/admin/ticket/create",
    "Notification_Template_Name": "Complaint_has_been_registered",
    "Recipient": "Customer Mobile Number",
    "File_Path": "src/controllers/admin/ticket/createTicket.js",
    "Line_Number": 156,
    "Message_Content": "Dear Customer, your complaint has been registered. Your ticket no is {ticketNo} Regards, Netway Internet Services",
    "Status": "Active"
  },
  {
    "S_No": 9,
    "Channel": "SMS",
    "Action_Name": "Ticket Update: Complaint Assigned to Engineer",
    "Trigger_Condition": "Ticket updated or assigned/reassigned to engineer",
    "Source_API_Route": "PATCH /api/admin/ticket/status/:ticketId or PUT update",
    "Notification_Template_Name": "A_complaint_assigned_to_Engineer",
    "Recipient": "Engineer / Staff Mobile Phone",
    "File_Path": "src/controllers/admin/ticket/updateTicket.js",
    "Line_Number": 147,
    "Message_Content": "Dear {engineerName} A complaint assign to you. Client Id :{clientId} Client Name:{clientName} Ticket No:{ticketNo} Mobile:{mobile} Address:{address} Detail:{detail} Netway Internet",
    "Status": "Active"
  },
  {
    "S_No": 10,
    "Channel": "SMS",
    "Action_Name": "Ticket Reply: Complaint Reply / Registration Update",
    "Trigger_Condition": "Staff / Admin replies to ticket",
    "Source_API_Route": "POST /api/admin/ticketReply/create",
    "Notification_Template_Name": "complaint has been registered",
    "Recipient": "Customer Mobile Number",
    "File_Path": "src/controllers/admin/ticketReply/createTickerReply.js",
    "Line_Number": 51,
    "Message_Content": "Dear Customer, your complaint has been registered. Your ticket no is {ticketNo} Regards, Netway Internet",
    "Status": "Active"
  },
  {
    "S_No": 11,
    "Channel": "Email",
    "Action_Name": "Admin Forgot Password: Password Reset OTP",
    "Trigger_Condition": "Admin initiates forgot password request",
    "Source_API_Route": "POST /api/admin/auth/forgotPassword",
    "Notification_Template_Name": "Password Reset OTP Email",
    "Recipient": "Admin Email Address",
    "File_Path": "src/controllers/admin/auth/sendOtpForResetPassword.js",
    "Line_Number": 21,
    "Message_Content": "Subject: Your Password Reset OTP | Body: Your password reset OTP is: {otp}. It is valid for 10 minutes.",
    "Status": "Active"
  },
  {
    "S_No": 12,
    "Channel": "Email",
    "Action_Name": "Website New Connection Request Notification",
    "Trigger_Condition": "Lead submits connection inquiry from public website",
    "Source_API_Route": "POST /api/admin/website/sendNewConnection",
    "Notification_Template_Name": "Website New Connection Request Email",
    "Recipient": "Admin / Sales Inbox (kesherwaniajeet@gmail.com / process.env.EMAIL_RECIVER)",
    "File_Path": "src/controllers/webiste/mailController/sendNewConnection.js",
    "Line_Number": 27,
    "Message_Content": "Subject: Website New Connection Request! | Body: Customer Name: {name}, Customer Mobile: {mobile}, City: {city}, Locality: {locality}",
    "Status": "Active"
  },
  {
    "S_No": 13,
    "Channel": "SOAP / IPACCT Server",
    "Action_Name": "IPACCT User Provisioning: Automated SMS & Invoice",
    "Trigger_Condition": "Admin creates customer (synced with IPACCT billing gateway)",
    "Source_API_Route": "POST /api/admin/user/create -> ipbillAddUser",
    "Notification_Template_Name": "<sendinvoice>true</sendinvoice> & <sendsms>true</sendsms>",
    "Recipient": "Customer Mobile / IPACCT Account",
    "File_Path": "src/services/ipacctUserServices.js",
    "Line_Number": 109,
    "Message_Content": "SOAP parameters instructs IPACCT Server to send SMS and Invoice automatically",
    "Status": "Active"
  }
];

// Helper to escape CSV fields
function toCsvRow(arr) {
  return arr.map(item => `"${String(item || "").replace(/"/g, '""')}"`).join(",");
}

// 1. Generate active notifications CSV
const headers = Object.keys(activeNotifications[0]);
const activeCsvLines = [toCsvRow(headers)];
for (const item of activeNotifications) {
  activeCsvLines.push(toCsvRow(headers.map(h => item[h])));
}
const activeCsvContent = "\ufeff" + activeCsvLines.join("\r\n");
const activeCsvPath = path.join(__dirname, "..", "notifications_inventory.csv");
fs.writeFileSync(activeCsvPath, activeCsvContent, "utf8");
console.log("Successfully generated:", activeCsvPath);

// 2. Generate complete SMS Templates library CSV
const smsTemplates = require("../src/utils/smsTemplate");
const templateHeaders = ["Template_ID", "Template_Name", "Message_Content", "Usage_Status"];
const templateLines = [toCsvRow(templateHeaders)];

const activeTemplateNames = [
  "your internet going to be expired soon",
  "Your_account_created",
  "Complaint_has_been_registered",
  "Internet bill",
  "Account Expiry",
  "Plan login credentials",
  "A_complaint_assigned_to_Engineer",
  "your account has been created",
  "complaint has been registered"
];

let id = 1;
for (const [name, val] of Object.entries(smsTemplates)) {
  const isUsed = activeTemplateNames.includes(name) ? "ACTIVE IN CODE" : "DEFINED (STANDBY)";
  templateLines.push(toCsvRow([id++, name, val.content, isUsed]));
}
const templateCsvPath = path.join(__dirname, "..", "all_sms_templates_library.csv");
fs.writeFileSync(templateCsvPath, "\ufeff" + templateLines.join("\r\n"), "utf8");
console.log("Successfully generated:", templateCsvPath);

// 3. Generate JSON file for programmatic use
const jsonPath = path.join(__dirname, "..", "notifications_inventory.json");
fs.writeFileSync(jsonPath, JSON.stringify({ activeNotifications, smsTemplatesLibrary: smsTemplates }, null, 2), "utf8");
console.log("Successfully generated:", jsonPath);
