// const Invoice = require("../../../models/invoice");
// const catchAsync = require("../../../utils/catchAsync");
// const AppError = require("../../../utils/AppError");
// const { generatePdf } = require("../../../utils/generatePdf");
// const numberToWords = require("number-to-words");

// exports.getInvoiceDetails = catchAsync(async (req, res) => {
//   const { invoiceId } = req.params;

//   const invoice = await Invoice.findById(invoiceId)
//     .populate(
//       "userId",
//       "generalInformation.name generalInformation.username generalInformation.phone generalInformation.email addressDetails.billingAddress"
//     )
//     .lean();

//   if (!invoice) {
//     throw new AppError("Invoice not found", 404);
//   }

//   /* ───────── USER DETAILS ───────── */
//   const user = invoice.userId?.generalInformation;
//   const billing = invoice.userId?.addressDetails?.billingAddress;

//   /* ───────── BUILD ADDRESS STRING ───────── */
//   const customerAddress = billing
//     ? [
//         billing.addressline1,
//         billing.addressline2,
//         billing.city,
//         billing.state,
//         billing.pincode
//       ]
//         .filter(Boolean)
//         .join(", ")
//     : "-";

//   /* ───────── TAX CALCULATION ───────── */
//   const sgst = invoice.amount * 0.09;
//   const cgst = invoice.amount * 0.09;
//   const grandTotal = invoice.amount + sgst + cgst;

//   const totalInWords =
//     numberToWords.toWords(Math.round(grandTotal)) +
//     " Rupees Only";

//   /* ───────── PDF DATA ───────── */
//   const pdfData = {
//     logoUrl: "http://localhost:5004/public/logo.png",

//     invoiceNumber: invoice.invoiceNumber,
//     invoiceDate: new Date(invoice.createdAt).toLocaleDateString(),
//     dueDate: new Date(invoice.createdAt).toLocaleDateString(),

//     companyName: "Netway Internet Services",
//     companyAddress:
//       "BRAHAM NIWAS HOSTEL, NEAR RKGIT COLLEGE, MEERUT ROAD, GHAZIABAD, UP - 201001",
//     companyGst: "09DAWPS9929D1ZO",

//     customerName: user?.name || "-",
//     username: user?.username || "-",
//     mobile: user?.phone || "-",
//     email: user?.email || "-",
//     customerAddress, 
//     packageName: invoice.packageName,
//     period: `${new Date(
//       invoice.duration.startDate
//     ).toLocaleDateString()} to ${new Date(
//       invoice.duration.endDate
//     ).toLocaleDateString()}`,

//     amount: invoice.amount.toFixed(2),
//     sgst: sgst.toFixed(2),
//     cgst: cgst.toFixed(2),
//     total: grandTotal.toFixed(2),
//     totalInWords
//   };

//   /* ───────── GENERATE PDF ───────── */
//   const pdfBuffer = await generatePdf({
//     templateName: "invoiceTemplate",
//     data: pdfData
//   });

//   res.set({
//     "Content-Type": "application/pdf",
//     "Content-Disposition": `attachment; filename=Invoice-${invoice.invoiceNumber}.pdf`
//   });

//   res.send(pdfBuffer);
// });


const Invoice = require("../../../models/invoice");
const Package = require("../../../models/package"); // ← important!
const User = require("../../../models/user");
const catchAsync = require("../../../utils/catchAsync");
const AppError = require("../../../utils/AppError");
const { generatePdf } = require("../../../utils/generatePdf");
const numberToWords = require("number-to-words");

exports.getInvoiceDetails = catchAsync(async (req, res) => {
  const { invoiceId } = req.params;

  const invoice = await Invoice.findById(invoiceId)
    .populate({
      path: "userId",
      select: "generalInformation.name generalInformation.username generalInformation.phone generalInformation.email addressDetails.billingAddress",
    })
    .populate({
      path: "package",
      select: "name validity", // get real package name + validity if needed
    })
    .lean();

  if (!invoice) {
    throw new AppError("Invoice not found", 404);
  }

  // ── Safe field access ───────────────────────────────────────
  const user = invoice.userId?.generalInformation || {};
  const billing = invoice.userId?.addressDetails?.billingAddress || {};

  const customerAddress = [
    billing.addressline1,
    billing.addressline2,
    billing.city,
    billing.state,
    billing.pincode,
  ]
    .filter(Boolean)
    .join(", ") || "—";

  // ── Use real package name from populated package (fallback to stored) ──
  const displayPackageName = invoice.package?.name || invoice.packageName || "—";

  // ── Duration (use real dates if available, fallback to createdAt logic) ──
  let period = "—";
  if (invoice.duration?.startDate && invoice.duration?.endDate) {
    period = `${new Date(invoice.duration.startDate).toLocaleDateString("en-IN")} to ${new Date(
      invoice.duration.endDate
    ).toLocaleDateString("en-IN")}`;
  } else if (invoice.package?.validity?.number && invoice.package?.validity?.unit) {
    // Optional fallback calculation if duration missing
    const start = new Date(invoice.createdAt);
    const end = new Date(start);
    const num = Number(invoice.package.validity.number);
    if (invoice.package.validity.unit.toLowerCase().includes("day")) {
      end.setDate(end.getDate() + num);
    }
    period = `${start.toLocaleDateString("en-IN")} to ${end.toLocaleDateString("en-IN")}`;
  }

  // ── Tax & Total (18% GST example – adjust rate if needed) ──
  const gstRate = 0.18; // 9% CGST + 9% SGST
  const sgst = invoice.amount * (gstRate / 2);
  const cgst = invoice.amount * (gstRate / 2);
  const grandTotal = invoice.amount + sgst + cgst;

  const totalInWords = numberToWords.toWords(Math.round(grandTotal)) + " Rupees Only";

  // ── Payment Status normalization ──
  let paymentStatus = (invoice.paymentStatus || "Unknown").trim();
  if (invoice.paidAmount >= invoice.amount) {
    paymentStatus = "Paid";
  } else if (invoice.paidAmount > 0 && invoice.paidAmount < invoice.amount) {
    paymentStatus = "Partial";
  } else if (invoice.paidAmount === 0) {
    paymentStatus = "Unpaid";
  }
  // You can add "Extra" / "Overpaid" logic if you store overpayment

  // ── PDF data object ─────────────────────────────────────────
  const pdfData = {
    logoUrl: "http://localhost:5004/public/logo.png", // ← change to production URL later

    invoiceNumber: invoice.invoiceNumber || "—",
    invoiceDate: new Date(invoice.createdAt).toLocaleDateString("en-IN"),
    dueDate: new Date(invoice.createdAt).toLocaleDateString("en-IN"), // or real due date

    companyName: "Netway Internet Services",
    companyAddress: "BRAHAM NIWAS HOSTEL, NEAR RKGIT COLLEGE, MEERUT ROAD, GHAZIABAD, UP - 201001",
    companyGst: "09DAWPS9929D1ZO",

    customerName: user.name || "—",
    username: user.username || "—",
    mobile: user.phone || "—",
    email: user.email || "—",
    customerAddress,

    packageName: displayPackageName,
    period,

    amount: invoice.amount.toFixed(2),
    sgst: sgst.toFixed(2),
    cgst: cgst.toFixed(2),
    total: grandTotal.toFixed(2),
    totalInWords,

    // Add to PDF if your template supports it
    paymentStatus,
    paidAmount: invoice.paidAmount?.toFixed(2) || "0.00",
  };

  // ── Generate PDF ────────────────────────────────────────────
  const pdfBuffer = await generatePdf({
    templateName: "invoiceTemplate",
    data: pdfData,
  });

  res.set({
    "Content-Type": "application/pdf",
    "Content-Disposition": `inline; filename="Invoice-${invoice.invoiceNumber || id}.pdf"`,
  });

  res.send(pdfBuffer);
});