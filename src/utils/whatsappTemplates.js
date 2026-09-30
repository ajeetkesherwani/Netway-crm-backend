const whatsappTemplates = {
  add_payment1: {
    name: "add_payment1",
    category: "UTILITY",
    bodyParamsCount: 2, // 1: Customer Name, 2: Amount
    hasHeader: false,
    content: "Dear {{1}},Your internet bill payment has been update INR {{2}}/-",
    footer: "Thanks, Netway Internet"
  },
  create_ticket1: {
    name: "create_ticket1",
    category: "UTILITY",
    bodyParamsCount: 1, // 1: Ticket No
    hasHeader: false,
    content: "Dear Customer,Your complaint has been registered. Your ticket no is *{{1}}* Our technical person will reach you asap.",
    footer: "Regards, Netway Internet"
  },
  assign_complaint_engg1: {
    name: "assign_complaint_engg1",
    category: "UTILITY",
    bodyParamsCount: 6, // 1: Client Id, 2: Client Name, 3: Ticket No, 4: Mobile, 5: Address, 6: Detail
    hasHeader: false,
    content: "Dear Engg,A complaint assign to you.\nClient Id : {{1}},Client Name: {{2}},Ticket No: {{3}},Mobile: {{4}},Address: {{5}},Detail: {{6}}Team, Netway Internet",
    footer: "Thanks"
  },
  resolve_complaint1: {
    name: "resolve_complaint1",
    category: "UTILITY",
    bodyParamsCount: 1, // 1: Ticket No
    hasHeader: false,
    content: "Dear Customer,Your Ticket *{{1}}* has been resolved successfully.",
    footer: "Regards, Netway Internet"
  },
  reminder: {
    name: "reminder",
    category: "UTILITY",
    bodyParamsCount: 1, // 1: Amount
    hasHeader: false,
    content: "Dear Customer,Your payment is overdue. Kindly pay your bill of Rs. {{1}}/- to enjoy uninterrupted service. To pay now, click the below button.",
    footer: "Warm Regards, Netway Internet"
  },
  create_invoice_recharge1: {
    name: "create_invoice_recharge1",
    category: "UTILITY",
    bodyParamsCount: 2, // 1: Plan Name, 2: Amount
    hasHeader: false,
    content: "Dear Customer,Your internet plan {{1}} bill payment of Rs. {{2}}/- has been successfully completed.",
    footer: "Thanks, Netway Internet"
  },
  create_invoice11: {
    name: "create_invoice11",
    category: "UTILITY",
    bodyParamsCount: 2, // 1: Amount, 2: Due Date
    hasHeader: false,
    content: "Dear Customer, Your internet bill *Rs. {{1}}/-* has been generated. Please pay your bill before due date *{{2}}* to avoid suspension of internet. You can pay from the below button.",
    footer: "Regards, Netway Internet"
  },
  otp_login1: {
    name: "otp_login1",
    category: "AUTHENTICATION",
    bodyParamsCount: 0,
    hasHeader: false,
    content: "", // Content missing in excel (likely default OTP format)
    footer: ""
  },
  change_password1: {
    name: "change_password1",
    category: "AUTHENTICATION",
    bodyParamsCount: 0,
    hasHeader: false,
    content: "", // Content missing in excel (likely default OTP format)
    footer: ""
  },
  after_recharge_complaint1: {
    name: "after_recharge_complaint1",
    category: "MARKETING",
    bodyParamsCount: 0,
    hasHeader: false,
    content: "Hello Sir/Ma’am,Your internet plan has been expired. Please renew now to instantly restore your services and enjoy uninterrupted high-speed internet. Don’t wait — stay connected without any hassle! For any queries, please contact us.",
    footer: "Regards, Netway Internet"
  },
  new_connection1: {
    name: "new_connection1",
    category: "MARKETING",
    bodyParamsCount: 1, // 1: Lead No
    hasHeader: false,
    content: "Dear Customer,Thank you for choosing our services! Your broadband connection request has been successfully received and is now being processed. Your lead no. is {{1}} Kindly find our broaband plans.",
    footer: "Regards, Netway Internet"
  },
  inform_to_client1: {
    name: "inform_to_client1",
    category: "UTILITY",
    bodyParamsCount: 3, // 1: Slots, 2: Engg Name, 3: Contact Number
    hasHeader: false,
    content: "Dear Customer,\nYour new internet connection slots {{1}} has been successfully assigned to our installation engineer.\nName: -{{2}},\nContact Number: -{{3}},\nThe engineer will contact you shortly to complete the installation process. Kindly wait for some time and keep your phone available.",
    footer: "Thank you for choosing Netway Internet Services."
  },
  after_recharge_complaint2: {
    name: "after_recharge_complaint2",
    category: "MARKETING",
    bodyParamsCount: 0,
    hasHeader: true, // Expects an Image in header
    content: "Hello Sir/Ma’am,\nYour internet plan has been expired. Please renew now to instantly restore your services and enjoy uninterrupted high-speed internet. Don’t wait — stay connected without any hassle! For any queries, please contact us.\n",
    footer: "Regards, Netway Internet\n\n"
  }
};

module.exports = whatsappTemplates;
